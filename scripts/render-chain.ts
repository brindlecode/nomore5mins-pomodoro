import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill } from "@remotion/renderer";
import * as path from "path";
import * as fs from "fs";
import { buildAllVideoSpecs, buildTimeline } from "../src/utils";
import type { VideoProps } from "../src/types";
import { FPS, WIDTH, HEIGHT, THUMB_W, THUMB_H } from "../src/config";
import { buildMetadata } from "./metadata-helper";

const args = process.argv.slice(2);
function getArg(name: string, def: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def;
}

const startIndex = parseInt(getArg("start", "0"));
const skipLongMin = parseInt(getArg("skip-long", "180"));
const maxHours = parseFloat(getArg("max-hours", "5"));
const maxMs = maxHours * 60 * 60 * 1000;

const allSpecs = buildAllVideoSpecs();
const TOTAL = allSpecs.length;

console.log("=".repeat(60));
console.log("  NoMore5Mins — Sequential Chain Renderer");
console.log("=".repeat(60));
console.log(`  Total catalog: ${TOTAL} videos`);
console.log(`  Starting from: #${startIndex}`);
console.log(`  Skip videos longer than: ${skipLongMin > 0 ? skipLongMin + " min" : "no skip"}`);
console.log(`  Max run time: ${maxHours} hours`);
console.log("=".repeat(60));

async function main() {
  const videosDir = path.join("pomodoro_output", "videos");
  const thumbsDir = path.join("pomodoro_output", "thumbs");
  const metaDir = path.join("pomodoro_output", "metadata");
  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(thumbsDir, { recursive: true });
  fs.mkdirSync(metaDir, { recursive: true });

  console.log("\n  Bundling...");
  const bundled = await bundle({
    entryPoint: path.join(__dirname, "..", "src", "index.ts"),
    webpackOverride: (config) => config,
  });
  console.log("  Bundle complete\n");

  const chainStart = Date.now();
  let rendered = 0;
  let skipped = 0;
  let currentIndex = startIndex;

  while (currentIndex < TOTAL) {
    const elapsed = Date.now() - chainStart;
    const remainingMs = maxMs - elapsed;
    const remainingMin = remainingMs / 1000 / 60;

    if (remainingMin < 30) {
      console.log(`\n  Time limit approaching (${remainingMin.toFixed(0)} min left). Stopping.`);
      break;
    }

    const spec = allSpecs[currentIndex];

    if (skipLongMin > 0 && spec.totalMin > skipLongMin) {
      console.log(`  SKIP [#${currentIndex}] ${spec.filename} (${spec.totalMin} min)`);
      skipped++;
      currentIndex++;
      continue;
    }

    console.log(`\n  [#${currentIndex}] ${spec.filename} (${spec.totalMin} min) — ${remainingMin.toFixed(0)} min left`);

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
        output: path.join(thumbsDir, `${spec.filename}_thumb.png`),
      });
      console.log(`  Thumbnail saved`);
    } catch (err) {
      console.error(`  Thumb error: ${(err as Error).message}`);
    }

    const videoStart = Date.now();
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
        outputLocation: path.join(videosDir, `${spec.filename}.mp4`),
        codec: "h264",
        imageFormat: "jpeg",
        jpegQuality: 80,
        onProgress: ({ progress }) => {
          const pct = Math.floor(progress * 100);
          if (pct % 10 === 0) {
            const vidElapsed = (Date.now() - videoStart) / 1000 / 60;
            process.stdout.write(`\r  Rendering: ${pct}% (${vidElapsed.toFixed(1)}m)`);
          }
        },
      });
      const renderTime = ((Date.now() - videoStart) / 1000 / 60).toFixed(1);
      console.log(`\n  Video saved (${renderTime} min)`);
      rendered++;
    } catch (err) {
      console.error(`\n  Render error: ${(err as Error).message}`);
    }

    try {
      const meta = buildMetadata(spec);
      fs.writeFileSync(
        path.join(metaDir, `${spec.filename}.txt`),
        `TITLE:\n${meta.title}\n\nDESCRIPTION:\n${meta.description}\n\nTAGS:\n${meta.tags}\n`,
        "utf-8"
      );
    } catch {}

    currentIndex++;
  }

  const totalTime = ((Date.now() - chainStart) / 1000 / 60).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  DONE: ${rendered} rendered, ${skipped} skipped, ${totalTime} min`);

  if (currentIndex < TOTAL) {
    fs.writeFileSync("next_index.txt", String(currentIndex), "utf-8");
    console.log(`  NEXT: ${currentIndex} (${TOTAL - currentIndex} remaining)`);
  } else {
    fs.writeFileSync("next_index.txt", "DONE", "utf-8");
    console.log(`  ALL ${TOTAL} VIDEOS COMPLETE`);
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
