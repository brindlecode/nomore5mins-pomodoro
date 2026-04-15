import type { VideoSpec } from "../src/types";
import { POMODOROS_PER_CYCLE, MUSIC_THEMES, AUDIO_MODES, SITE_URL } from "../src/config";

export function buildMetadata(spec: VideoSpec): { filename: string; title: string; description: string; tags: string } {
  const cfg = spec.config;
  const themeLabel = MUSIC_THEMES[spec.theme].label;

  let musicSuffix: string;
  if (spec.audioMode === "music") {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel} Study Music` : "with Study Music";
  } else if (spec.audioMode === "ambient") {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel}` : "with Ambient Sounds";
  } else {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel}` : "with Calm Music";
  }

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

  let body: string;
  if (spec.mode === "sprint") {
    const spr = spec.sprint ?? 1;
    const numBreaks = Math.max(0, spr - 1);
    if (spr === 1) {
      body = `A clean, distraction-free ${cfg.label} Pomodoro timer. ${cfg.workMin} minutes of focus time.`;
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
    tags.push(`pomodoro ${themeLabel.toLowerCase()}`, `study ${themeLabel.toLowerCase()}`);
  }
  if (spec.mode === "cycle") tags.push("pomodoro cycle", "long break");
  if ((spec.sprint ?? 0) > 1) tags.push("long study session", "study sprint");
  if (cfg.workMin === 25) tags.push("classic pomodoro");
  if (cfg.workMin === 52) tags.push("52 17 method");
  if (cfg.workMin === 90) tags.push("ultradian rhythm", "deep work");
  if (cfg.workMin <= 20) tags.push("adhd timer", "short focus");

  return {
    filename: spec.filename,
    title,
    description,
    tags: tags.slice(0, 40).join(", "),
  };
}
