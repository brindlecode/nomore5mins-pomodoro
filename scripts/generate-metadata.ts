/**
 * NoMore5Mins — YouTube Metadata Generator
 * ==========================================
 * Generates title, description, and tags for each video.
 *
 * Usage:
 *   npx tsx scripts/generate-metadata.ts                # generate all metadata
 *   npx tsx scripts/generate-metadata.ts --list         # show catalog count
 *   npx tsx scripts/generate-metadata.ts --batch 1      # batch 1 metadata only
 *   npx tsx scripts/generate-metadata.ts --config 25-5  # specific config
 */
import * as fs from "fs";
import * as path from "path";
import { buildAllVideoSpecs } from "../src/utils";
import type { VideoSpec } from "../src/types";
import { POMODOROS_PER_CYCLE, MUSIC_THEMES, AUDIO_MODES, SITE_URL } from "../src/config";

const args = process.argv.slice(2);
function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}
function hasFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

const showList = hasFlag("list");
const batchNum = getArg("batch") ? parseInt(getArg("batch")!) : undefined;
const batchSize = parseInt(getArg("batch-size") ?? "50");
const filterConfig = getArg("config");
const outputDir = getArg("output") ?? "./pomodoro_output";

let specs = buildAllVideoSpecs();
if (filterConfig) specs = specs.filter((s) => s.config.id === filterConfig);

if (showList) {
  const sprintCount = specs.filter((s) => s.mode === "sprint").length;
  const cycleCount = specs.filter((s) => s.mode === "cycle").length;
  console.log("═".repeat(60));
  console.log("  FULL POMODORO VIDEO CATALOG");
  console.log("═".repeat(60));
  console.log(`  Sprint videos: ${sprintCount}`);
  console.log(`  Cycle videos:  ${cycleCount}`);
  console.log(`  GRAND TOTAL:   ${specs.length}`);
  console.log("═".repeat(60));
  process.exit(0);
}

if (batchNum !== undefined) {
  const start = (batchNum - 1) * batchSize;
  specs = specs.slice(start, start + batchSize);
}

// ── Build metadata for a single spec ──
function buildMetadata(spec: VideoSpec): { filename: string; title: string; description: string; tags: string } {
  const cfg = spec.config;
  const themeLabel = MUSIC_THEMES[spec.theme].label;

  // Music suffix in title
  let musicSuffix: string;
  if (spec.audioMode === "music") {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel} Study Music` : "with Study Music";
  } else if (spec.audioMode === "ambient") {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel}` : "with Ambient Sounds";
  } else {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel}` : "with Calm Music";
  }

  // Title
  let title: string;
  if (spec.mode === "sprint") {
    const spr = spec.sprint ?? 1;
    if (spr === 1) {
      title = `${cfg.label} Pomodoro Timer — ${cfg.workMin} Min Study, ${cfg.breakMin} Min Break ${musicSuffix}`;
    } else {
      title = `${spr}×${cfg.label} Pomodoro Timer — ${spec.focusMin} Min Study Session ${musicSuffix}`;
    }
  } else {
    const cyc = spec.cycles ?? 1;
    const lb = spec.longBreak ?? 15;
    title = `${cfg.label} Pomodoro — ${cyc} Full Cycle${cyc > 1 ? "s" : ""} + ${lb}m Long Break ${musicSuffix}`;
  }
  if (cfg.badge && title.length + cfg.badge.length + 5 <= 100) {
    title += ` [${cfg.badge}]`;
  }
  title = title.slice(0, 100);

  // Audio mode description
  let focusDesc: string, breakDesc: string;
  if (spec.audioMode === "silent") {
    focusDesc = "Complete silence for deep concentration";
    breakDesc = "Soft music to help you recharge";
  } else if (spec.audioMode === "music") {
    focusDesc = "Gentle study music at low volume for flow state";
    breakDesc = "Relaxing music at full volume to recharge";
  } else {
    focusDesc = "Continuous ambient sound for immersive focus";
    breakDesc = "Same ambient sound continues — seamless transition";
  }

  // Body
  let body: string;
  if (spec.mode === "sprint") {
    const spr = spec.sprint ?? 1;
    const numBreaks = Math.max(0, spr - 1);
    if (spr === 1) {
      body = `A clean, distraction-free ${cfg.label} Pomodoro timer. ${cfg.workMin} minutes of focus time. ${focusDesc.charAt(0).toLowerCase() + focusDesc.slice(1)}.`;
    } else {
      body = `${spr}-session Pomodoro sprint using the ${cfg.label} method. ${spr} rounds of ${cfg.workMin}-minute focus blocks with ${numBreaks} breaks of ${cfg.breakMin} minutes. ${spec.focusMin} minutes of focus. Total: ${spec.totalMin} minutes.`;
    }
  } else {
    const cyc = spec.cycles ?? 1;
    const lb = spec.longBreak ?? 15;
    body = `Classic Pomodoro cycle: ${POMODOROS_PER_CYCLE} rounds of ${cfg.workMin}-minute focus + ${cfg.breakMin}-minute short break, followed by a ${lb}-minute long break. ${cyc > 1 ? `Repeated ${cyc} times. ` : ""}Total: ${spec.totalMin} minutes. ${spec.focusMin} minutes of pure focus time.`;
  }

  const description = `🍅 ${title}

${body}

How it works:
- Focus Time: ${focusDesc}
- Short Break: ${breakDesc}
${spec.mode === "cycle" ? "- Long Break: Extended rest with calming melody\n" : ""}- Bell signal at each focus start with a motivational message
- Gentle chime when break begins
- 10-second countdown alert before each break ends
- Visual progress tracking throughout

${cfg.description}

Perfect for:
- Studying for exams & homework
- Remote work focus blocks
- Coding & writing sprints
- ADHD-friendly structured sessions
- Deep reading & research

🔔 Subscribe for more Pomodoro timers, study tools & focus sessions!
👍 Like this video if it helped you stay focused!

🌐 Free Online Timer Tools:
⏰ Alarm Clock → https://${SITE_URL}/alarm
⏱️ Timer → https://${SITE_URL}/timer
🍅 Pomodoro → https://${SITE_URL}/pomodoro
⏱️ Stopwatch → https://${SITE_URL}/stopwatch

──────────────────
🌐 https://${SITE_URL}
──────────────────`;

  // Tags
  const tags: string[] = [
    "pomodoro timer", "pomodoro technique", "study timer",
    "focus timer", "pomodoro", "study with me",
    `${cfg.workMin} minute timer`, `${cfg.label} pomodoro`,
    "concentration timer", "productivity timer",
    "study music", "break timer", "exam study timer",
    "homework timer", "focus session", "deep work timer",
    "nomore5mins", "study session", "adhd study timer",
    "pomodoro study", "timer with music break",
  ];

  if (themeLabel && themeLabel !== "Calm Music") {
    tags.push(`pomodoro ${themeLabel.toLowerCase()}`, `study ${themeLabel.toLowerCase()}`, `${themeLabel.toLowerCase()} timer`);
  }
  if (spec.mode === "cycle") {
    tags.push("pomodoro cycle", "long break", "classic pomodoro cycle");
  }
  if ((spec.sprint ?? 0) > 1) {
    tags.push("long study session", "study sprint", `${spec.totalMin} minute study`);
  }
  if (cfg.workMin === 25) tags.push("classic pomodoro");
  if (cfg.workMin === 52) tags.push("52 17 method", "desktime method");
  if (cfg.workMin === 90) tags.push("ultradian rhythm", "deep work", "90 minute focus");
  if (cfg.workMin <= 20) tags.push("adhd timer", "adhd friendly timer", "short focus");
  if (spec.audioMode === "music") tags.push("focus music pomodoro", "lofi study");
  if (spec.audioMode === "ambient") tags.push("ambient study", "background noise study");

  return {
    filename: spec.filename,
    title,
    description,
    tags: tags.slice(0, 40).join(", "),
  };
}

// ── Main ──
function main() {
  const metaDir = batchNum !== undefined
    ? path.join(outputDir, "metadata", `batch_${String(batchNum).padStart(2, "0")}`)
    : path.join(outputDir, "metadata");
  fs.mkdirSync(metaDir, { recursive: true });

  const csvRows: Array<{ filename: string; title: string; description: string; tags: string }> = [];

  for (const spec of specs) {
    const meta = buildMetadata(spec);
    csvRows.push(meta);

    // Individual .txt file
    const txtContent = `TITLE:\n${meta.title}\n\nDESCRIPTION:\n${meta.description}\n\nTAGS:\n${meta.tags}\n`;
    fs.writeFileSync(path.join(metaDir, `${meta.filename}.txt`), txtContent, "utf-8");
  }

  // CSV
  const csvPath = batchNum !== undefined
    ? path.join(outputDir, `metadata_batch_${String(batchNum).padStart(2, "0")}.csv`)
    : path.join(outputDir, "youtube_metadata.csv");

  const csvHeader = "filename,title,description,tags\n";
  const csvBody = csvRows
    .map((r) => `"${r.filename}","${r.title.replace(/"/g, '""')}","${r.description.replace(/"/g, '""')}","${r.tags.replace(/"/g, '""')}"`)
    .join("\n");
  fs.writeFileSync(csvPath, csvHeader + csvBody, "utf-8");

  console.log(`\n📋 Metadata generated:`);
  console.log(`   Individual files: ${metaDir}/ (${csvRows.length} files)`);
  console.log(`   CSV: ${csvPath}`);
}

main();
