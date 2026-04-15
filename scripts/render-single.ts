/**
 * Render a single video by its index in the full catalog.
 * Usage: npx tsx scripts/render-single.ts --index 42
 */
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill } from "@remotion/renderer";
import * as path from "path";
import * as fs from "fs";
import { buildAllVideoSpecs, buildTimeline } from "../src/utils";
import type { VideoProps } from "../src/types";
import { FPS, WIDTH, HEIGHT, THUMB_W, THUMB_H } from "../src/config";

const args = process.argv.slice(2);
const idxArg = args.indexOf("--index");
if (idxArg === -1 || !args[idxArg + 1]) {
  console.error("Usage: npx tsx scripts/render-single.ts --index <number>");
  process.exit(1);
}
const videoIndex = parseInt(args[idxArg + 1]);

const allSpecs = buildAllVideoSpecs();

if (videoIndex < 0 || videoIndex >= allSpecs.length) {
  console.error(`Index ${videoIndex} out of range. Total: ${allSpecs.length}`);
  process.exit(1);
}

const spec = allSpecs[videoIndex];

async function main() {
  const videosDir = path.join("pomodoro_output", "videos");
  const thumbsDir = path.join("pomodoro_output", "thumbs");
  const metaDir = path.join("pomodoro_output", "metadata");
  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  fs.mkdirSync(metaDir, { recursive: true });

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  Video #${videoIndex} / ${allSpecs.length}`);
  console.log(`  File: ${spec.filename}`);
  console.log(`  Mode: ${spec.mode} | Config: ${spec.config.id} | Duration: ${spec.totalMin} min`);
  console.log(`  Theme: ${spec.themeLabel} | Audio: ${spec.audioModeLabel}`);
  console.log(`${"═".repeat(60)}\n`);

  // Estimate render time — skip if video would likely timeout (>300 min at 30fps)
  const estMinutes = (spec.totalSec * 30) / 60 / 25; // rough: 25 frames/sec render speed
  console.log(`  Estimated render time: ~${estMinutes.toFixed(0)} min`);
  
  if (spec.totalMin > 600) {
    console.log(`  ⚠️ Video is ${spec.totalMin} min (>10h) — very long, may timeout`);
    console.log(`  Rendering anyway...`);
  }

  const inputProps: VideoProps = {
    config: spec.config.id,
    mode: spec.mode,
    ...(spec.mode === "sprint" ? { sprint: spec.sprint } : {}),
    ...(spec.mode === "cycle" ? { cycles: spec.cycles, longBreak: spec.longBreak } : {}),
    audioMode: spec.audioMode,
    theme: spec.theme,
  };

  const timeline = buildTimeline(inputProps);
  const durationInFrames = timeline.totalDurationSec * FPS;

  console.log(`  Total frames: ${durationInFrames.toLocaleString()}`);
  console.log(`  Bundling...`);

  const bundled = await bundle({
    entryPoint: path.join(__dirname, "..", "src", "index.ts"),
    webpackOverride: (config) => config,
  });
  console.log(`  ✅ Bundle complete\n`);

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
    console.log(`  📷 Thumbnail: ${spec.filename}_thumb.png`);
  } catch (err) {
    console.error(`  ⚠️ Thumbnail error: ${(err as Error).message}`);
  }

  // Video
  const videoPath = path.join(videosDir, `${spec.filename}.mp4`);
  const startTime = Date.now();
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
      jpegQuality: 80,
      onProgress: ({ progress }) => {
        const pct = Math.floor(progress * 100);
        if (pct % 5 === 0) {
          const elapsed = (Date.now() - startTime) / 1000 / 60;
          const eta = progress > 0 ? (elapsed / progress * (1 - progress)).toFixed(1) : "?";
          process.stdout.write(`\r  Rendering: ${pct}% (${elapsed.toFixed(1)}m elapsed, ~${eta}m remaining)`);
        }
      },
    });
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`\n  ✅ Video: ${spec.filename}.mp4 (${totalTime} min render time)`);
  } catch (err) {
    console.error(`\n  ❌ Video error: ${(err as Error).message}`);
  }

  // Metadata
  const { buildMetadata } = await import("./metadata-helper");
  const meta = buildMetadata(spec);
  const metaPath = path.join(metaDir, `${spec.filename}.txt`);
  fs.writeFileSync(metaPath, `TITLE:\n${meta.title}\n\nDESCRIPTION:\n${meta.description}\n\nTAGS:\n${meta.tags}\n`, "utf-8");
  console.log(`  📋 Metadata: ${spec.filename}.txt`);

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ✅ Video #${videoIndex} complete!`);
  console.log(`${"═".repeat(60)}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
