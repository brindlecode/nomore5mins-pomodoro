/**
 * NoMore5Mins — Batch Video Render Script
 * ========================================
 * Renders Pomodoro videos using Remotion in configurable batches.
 *
 * Usage:
 *   npx tsx scripts/render.ts                          # render ALL videos
 *   npx tsx scripts/render.ts --batch 1                # render batch 1 (50 videos)
 *   npx tsx scripts/render.ts --batch 1 --batch-size 25
 *   npx tsx scripts/render.ts --batch-plan             # show batch plan without rendering
 *   npx tsx scripts/render.ts --config 25-5            # filter by config
 *   npx tsx scripts/render.ts --mode sprint            # filter by mode
 *   npx tsx scripts/render.ts --theme piano            # filter by theme
 *   npx tsx scripts/render.ts --audio-mode silent      # filter by audio mode
 *   npx tsx scripts/render.ts --sprint 2               # filter by sprint level
 *   npx tsx scripts/render.ts --dry-run                # show what would be rendered
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import * as path from "path";
import * as fs from "fs";
import { buildAllVideoSpecs, buildTimeline } from "../src/utils";
import type { VideoSpec, VideoProps } from "../src/types";
import { FPS, WIDTH, HEIGHT, THUMB_W, THUMB_H } from "../src/config";

// ── Parse CLI args ──
const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
function hasFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

const batchNum = getArg("batch") ? parseInt(getArg("batch")!) : undefined;
const batchSize = parseInt(getArg("batch-size") ?? "50");
const showPlan = hasFlag("batch-plan");
const dryRun = hasFlag("dry-run");
const filterConfig = getArg("config");
const filterMode = getArg("mode");
const filterTheme = getArg("theme");
const filterAudioMode = getArg("audio-mode");
const filterSprint = getArg("sprint") ? parseInt(getArg("sprint")!) : undefined;
const outputDir = getArg("output") ?? "./pomodoro_output";
const thumbOnly = hasFlag("thumbnail-only");
const concurrency = parseInt(getArg("concurrency") ?? "1");

// ── Build and filter specs ──
let specs = buildAllVideoSpecs();

if (filterConfig) specs = specs.filter(s => s.config.id === filterConfig);
if (filterMode) specs = specs.filter(s => s.mode === filterMode);
if (filterTheme) specs = specs.filter(s => s.theme === filterTheme);
if (filterAudioMode) specs = specs.filter(s => s.audioMode === filterAudioMode);
if (filterSprint) specs = specs.filter(s => s.sprint === filterSprint);

console.log("═".repeat(60));
console.log("  NoMore5Mins — Pomodoro Video Renderer (Remotion)");
console.log("═".repeat(60));
console.log(`  Total matching specs: ${specs.length}`);

// ── Batch plan ──
if (showPlan) {
  const totalBatches = Math.ceil(specs.length / batchSize);
  console.log(`\n  BATCH PLAN — ${specs.length} videos / ${batchSize} per batch = ${totalBatches} batches\n`);

  for (let b = 1; b <= totalBatches; b++) {
    const start = (b - 1) * batchSize;
    const end = Math.min(start + batchSize, specs.length);
    const batchSpecs = specs.slice(start, end);
    const configs = new Set(batchSpecs.map(s => s.config.id));
    const modes = new Set(batchSpecs.map(s => s.mode));

    console.log(`  📦 BATCH ${String(b).padStart(2, "0")}  |  #${start + 1}–${end}  |  ${batchSpecs.length} videos`);
    console.log(`     First: ${batchSpecs[0].filename}`);
    console.log(`     Last:  ${batchSpecs[batchSpecs.length - 1].filename}`);
    console.log(`     Configs: ${[...configs].join(", ")}  |  Modes: ${[...modes].join(", ")}`);
    console.log(`     Command: npx tsx scripts/render.ts --batch ${b} --batch-size ${batchSize}`);
    console.log();
  }

  console.log("═".repeat(60));
  console.log("  ALL COMMANDS:");
  for (let b = 1; b <= totalBatches; b++) {
    console.log(`  npx tsx scripts/render.ts --batch ${b} --batch-size ${batchSize}`);
  }
  console.log("═".repeat(60));
  process.exit(0);
}

// ── Slice batch ──
let renderSpecs: VideoSpec[];
if (batchNum !== undefined) {
  const totalBatches = Math.ceil(specs.length / batchSize);
  if (batchNum < 1 || batchNum > totalBatches) {
    console.error(`❌ Batch ${batchNum} invalid. Total: ${totalBatches} (1-${totalBatches})`);
    process.exit(1);
  }
  const start = (batchNum - 1) * batchSize;
  renderSpecs = specs.slice(start, start + batchSize);
  console.log(`\n  📦 BATCH ${batchNum}/${totalBatches}: Videos #${start + 1}–${start + renderSpecs.length} (${renderSpecs.length} videos)`);
} else {
  renderSpecs = specs;
}

if (dryRun) {
  console.log("\n  DRY RUN — Would render:");
  renderSpecs.forEach((s, i) => {
    console.log(`    ${i + 1}. ${s.filename} (${s.totalMin} min, ${s.mode})`);
  });
  console.log(`\n  Total: ${renderSpecs.length} videos`);
  process.exit(0);
}

// ── Render ──
async function main() {
  // Create output dirs
  const videosDir = path.join(outputDir, "videos");
  const thumbsDir = path.join(outputDir, "thumbs");
  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });

  // Bundle the Remotion project
  console.log("\n  📦 Bundling Remotion project...");
  const bundled = await bundle({
    entryPoint: path.join(__dirname, "..", "src", "index.ts"),
    webpackOverride: (config) => config,
  });
  console.log("  ✅ Bundle complete\n");

  const total = renderSpecs.length;
  let completed = 0;
  const startTime = Date.now();

  for (const spec of renderSpecs) {
    completed++;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const eta = completed > 1
      ? (((Date.now() - startTime) / completed) * (total - completed) / 1000 / 60).toFixed(1)
      : "?";
    console.log(`\n${"─".repeat(60)}`);
    console.log(`  [${completed}/${total}] ${spec.filename}  (${spec.totalMin} min, ETA: ${eta}m)`);

    const inputProps: VideoProps = {
      config: spec.config.id,
      mode: spec.mode,
      ...(spec.mode === "sprint" ? { sprint: spec.sprint } : {}),
      ...(spec.mode === "cycle" ? { cycles: spec.cycles, longBreak: spec.longBreak } : {}),
      audioMode: spec.audioMode,
      theme: spec.theme,
    };

    // Calculate duration from timeline
    const timeline = buildTimeline(inputProps);
    const durationInFrames = timeline.totalDurationSec * FPS;

    // Thumbnail
    const thumbPath = path.join(thumbsDir, `${spec.filename}_thumb.png`);
    try {
      await renderStill({
        serveUrl: bundled,
        composition: {
          id: "Thumbnail",
          width: THUMB_W,
          height: THUMB_H,
          fps: FPS,
          durationInFrames: 1,
          defaultProps: inputProps,
          props: inputProps,
          defaultCodec: "h264",
        },
        output: thumbPath,
      });
      console.log(`  📷 Thumbnail saved`);
    } catch (err) {
      console.error(`  ⚠️ Thumbnail error: ${(err as Error).message}`);
    }

    // Video (skip if thumbnail-only)
    if (!thumbOnly) {
      const videoPath = path.join(videosDir, `${spec.filename}.mp4`);
      try {
        await renderMedia({
          serveUrl: bundled,
          composition: {
            id: "PomodoroVideo",
            width: WIDTH,
            height: HEIGHT,
            fps: FPS,
            durationInFrames,
            defaultProps: inputProps,
            props: inputProps,
            defaultCodec: "h264",
          },
          outputLocation: videoPath,
          codec: "h264",
          imageFormat: "jpeg",
          jpegQuality: 85,
          onProgress: ({ progress }) => {
            if (Math.floor(progress * 100) % 10 === 0) {
              process.stdout.write(`\r    Rendering: ${Math.floor(progress * 100)}%`);
            }
          },
        });
        console.log(`\r    ✅ Video saved                  `);
      } catch (err) {
        console.error(`\r    ❌ Render error: ${(err as Error).message}`);
      }
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🎉 DONE! ${completed} videos in ${totalTime} min`);
  console.log(`  📁 Videos: ${videosDir}`);
  console.log(`  📷 Thumbs: ${thumbsDir}`);
  if (batchNum !== undefined) {
    const totalBatches = Math.ceil(specs.length / batchSize);
    const remaining = totalBatches - batchNum;
    if (remaining > 0) {
      console.log(`  ⏭️  Next: npx tsx scripts/render.ts --batch ${batchNum + 1} --batch-size ${batchSize}`);
    } else {
      console.log(`  ✅ ALL BATCHES COMPLETE!`);
    }
  }
  console.log("═".repeat(60));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
