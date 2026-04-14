/**
 * NoMore5Mins — Thumbnail-Only Render Script
 * ============================================
 * Renders thumbnails much faster than full videos.
 *
 * Usage:
 *   npx tsx scripts/render-thumbnail.ts                    # all thumbnails
 *   npx tsx scripts/render-thumbnail.ts --batch 1          # batch 1
 *   npx tsx scripts/render-thumbnail.ts --config 25-5      # specific config
 */
import { bundle } from "@remotion/bundler";
import { renderStill } from "@remotion/renderer";
import * as path from "path";
import * as fs from "fs";
import { buildAllVideoSpecs } from "../src/utils";

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

const batchNum = getArg("batch") ? parseInt(getArg("batch")!) : undefined;
const batchSize = parseInt(getArg("batch-size") ?? "50");
const filterConfig = getArg("config");
const filterMode = getArg("mode");
const filterTheme = getArg("theme");
const outputDir = getArg("output") ?? "./pomodoro_output";

let specs = buildAllVideoSpecs();
if (filterConfig) specs = specs.filter(s => s.config.id === filterConfig);
if (filterMode) specs = specs.filter(s => s.mode === filterMode);
if (filterTheme) specs = specs.filter(s => s.theme === filterTheme);

if (batchNum !== undefined) {
  const start = (batchNum - 1) * batchSize;
  specs = specs.slice(start, start + batchSize);
}

async function main() {
  const thumbsDir = path.join(outputDir, "thumbs");
  fs.mkdirSync(thumbsDir, { recursive: true });

  console.log(`📷 Rendering ${specs.length} thumbnails...\n`);

  const bundled = await bundle({
    entryPoint: path.join(__dirname, "..", "src", "index.ts"),
    webpackOverride: (config) => config,
  });

  let done = 0;
  for (const spec of specs) {
    done++;
    const thumbPath = path.join(thumbsDir, `${spec.filename}_thumb.png`);

    const inputProps = {
      config: spec.config.id,
      mode: spec.mode,
      ...(spec.mode === "sprint" ? { sprint: spec.sprint } : {}),
      ...(spec.mode === "cycle" ? { cycles: spec.cycles, longBreak: spec.longBreak } : {}),
      audioMode: spec.audioMode,
      theme: spec.theme,
    };

    try {
      await renderStill({
        serveUrl: bundled,
        composition: {
          id: "Thumbnail",
          width: 1280,
          height: 720,
          fps: 30,
          durationInFrames: 1,
          defaultProps: inputProps,
          props: inputProps,
          defaultCodec: "h264",
        },
        output: thumbPath,
      });
      process.stdout.write(`\r  [${done}/${specs.length}] ${spec.filename}`);
    } catch (err) {
      console.error(`\n  ⚠️ ${spec.filename}: ${(err as Error).message}`);
    }
  }

  console.log(`\n\n✅ Done! ${done} thumbnails → ${thumbsDir}`);
}

main().catch(console.error);
