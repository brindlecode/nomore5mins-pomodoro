// ═══════════════════════════════════════════════════════════════
// NoMore5Mins Pomodoro — Utilities
// ═══════════════════════════════════════════════════════════════
import type {
  VideoProps,
  PhaseSegment,
  VideoTimeline,
  AudioMode,
  MusicTheme,
  PomodoroConfigId,
  VideoSpec,
} from "./types";
import {
  getConfig,
  INTRO_DURATION,
  END_DURATION,
  MAX_VIDEO_SEC,
  FOCUS_PHRASES,
  BREAK_PHRASES,
  LONG_BREAK_PHRASES,
  POMODOROS_PER_CYCLE,
  MUSIC_THEMES,
  AUDIO_MODES,
  POMODORO_CONFIGS,
  SPRINT_LEVELS,
  CYCLE_COUNTS,
  LONG_BREAK_OPTIONS,
} from "./config";

// ── Seeded random ──
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    hash = ((hash << 5) - hash + c) | 0;
  }
  return Math.abs(hash);
}

function pickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ── Format time ──
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Build video timeline ──
export function buildTimeline(props: VideoProps): VideoTimeline {
  const cfg = getConfig(props.config);
  const workSec = cfg.workMin * 60;
  const breakSec = cfg.breakMin * 60;
  const segments: PhaseSegment[] = [];
  const seed = hashString(`${props.config}_${props.mode}_${props.sprint ?? 0}_${props.cycles ?? 0}_${props.longBreak ?? 0}_${props.theme}_${props.audioMode}`);
  const rng = seededRandom(seed);

  let totalFocusMin = 0;

  if (props.mode === "sprint") {
    const sprints = props.sprint ?? 1;
    const numBreaks = Math.max(0, sprints - 1);
    const totalSessions = sprints;

    // Intro
    segments.push({
      phase: "intro",
      durationSec: INTRO_DURATION,
      sessionIndex: 0,
      totalSessions,
      phrase: "",
    });

    // Sprint sessions
    for (let s = 0; s < sprints; s++) {
      // Focus
      segments.push({
        phase: "focus",
        durationSec: workSec,
        sessionIndex: s,
        totalSessions,
        phrase: pickRandom(FOCUS_PHRASES, rng),
      });
      totalFocusMin += cfg.workMin;

      // Break (no break after last focus)
      if (s < sprints - 1) {
        segments.push({
          phase: "break",
          durationSec: breakSec,
          sessionIndex: s,
          totalSessions,
          phrase: pickRandom(BREAK_PHRASES, rng),
        });
      }
    }

    // End
    segments.push({
      phase: "end",
      durationSec: END_DURATION,
      sessionIndex: 0,
      totalSessions,
      phrase: "",
    });

    const totalContentMin = sprints * cfg.workMin + numBreaks * cfg.breakMin;
    const totalDurationSec = segments.reduce((a, s) => a + s.durationSec, 0);

    return {
      segments,
      totalDurationSec,
      totalFocusMin,
      totalContentMin: totalContentMin,
      filename: buildSprintFilename(cfg.id, sprints, props.theme, props.audioMode),
      youtubeTitle: buildTitle(props),
    };
  } else {
    // Cycle mode
    const cycles = props.cycles ?? 1;
    const longBreakMin = props.longBreak ?? 15;
    const longBreakSec = longBreakMin * 60;
    const totalSessions = cycles * POMODOROS_PER_CYCLE;

    segments.push({
      phase: "intro",
      durationSec: INTRO_DURATION,
      sessionIndex: 0,
      totalSessions,
      phrase: "",
    });

    let sessionGlobal = 0;
    for (let c = 0; c < cycles; c++) {
      for (let p = 0; p < POMODOROS_PER_CYCLE; p++) {
        // Focus
        segments.push({
          phase: "focus",
          durationSec: workSec,
          sessionIndex: sessionGlobal,
          totalSessions,
          phrase: pickRandom(FOCUS_PHRASES, rng),
        });
        totalFocusMin += cfg.workMin;

        // Short break (always after every pomodoro in cycle mode)
        segments.push({
          phase: "break",
          durationSec: breakSec,
          sessionIndex: sessionGlobal,
          totalSessions,
          phrase: pickRandom(BREAK_PHRASES, rng),
        });

        sessionGlobal++;
      }

      // Long break
      segments.push({
        phase: "longBreak",
        durationSec: longBreakSec,
        sessionIndex: sessionGlobal - 1,
        totalSessions,
        phrase: pickRandom(LONG_BREAK_PHRASES, rng),
        isLong: true,
      });
    }

    segments.push({
      phase: "end",
      durationSec: END_DURATION,
      sessionIndex: 0,
      totalSessions,
      phrase: "",
    });

    const totalContentMin = cycles * (POMODOROS_PER_CYCLE * (cfg.workMin + cfg.breakMin) + longBreakMin);
    const totalDurationSec = segments.reduce((a, s) => a + s.durationSec, 0);

    return {
      segments,
      totalDurationSec,
      totalFocusMin,
      totalContentMin,
      filename: buildCycleFilename(cfg.id, cycles, longBreakMin, props.theme, props.audioMode),
      youtubeTitle: buildTitle(props),
    };
  }
}

// ── Filenames ──
export function buildSprintFilename(
  configId: PomodoroConfigId, sprints: number,
  theme: MusicTheme, audioMode: AudioMode
): string {
  let base = sprints === 1 ? `pomodoro_${configId}` : `pomodoro_${sprints}x${configId}`;
  if (audioMode !== "silent") base += `_${audioMode}`;
  const suffix = MUSIC_THEMES[theme].suffix;
  if (suffix) base += `_${suffix}`;
  return base;
}

export function buildCycleFilename(
  configId: PomodoroConfigId, cycles: number, longBreak: number,
  theme: MusicTheme, audioMode: AudioMode
): string {
  let base = `pomodoro_cycle${cycles}x${configId}_lb${longBreak}`;
  if (audioMode !== "silent") base += `_${audioMode}`;
  const suffix = MUSIC_THEMES[theme].suffix;
  if (suffix) base += `_${suffix}`;
  return base;
}

// ── Title builder ──
function buildTitle(props: VideoProps): string {
  const cfg = getConfig(props.config);
  const themeLabel = MUSIC_THEMES[props.theme].label;

  let musicSuffix: string;
  if (props.audioMode === "music") {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel} Study Music` : "with Study Music";
  } else if (props.audioMode === "ambient") {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel}` : "with Ambient Sounds";
  } else {
    musicSuffix = themeLabel !== "Calm Music" ? `with ${themeLabel}` : "with Calm Music";
  }

  let title: string;
  if (props.mode === "sprint") {
    const spr = props.sprint ?? 1;
    if (spr === 1) {
      title = `${cfg.label} Pomodoro Timer — ${cfg.workMin} Min Study, ${cfg.breakMin} Min Break ${musicSuffix}`;
    } else {
      const focusMin = spr * cfg.workMin;
      title = `${spr}×${cfg.label} Pomodoro Timer — ${focusMin} Min Study Session ${musicSuffix}`;
    }
  } else {
    const cyc = props.cycles ?? 1;
    const lb = props.longBreak ?? 15;
    title = `${cfg.label} Pomodoro — ${cyc} Full Cycle${cyc > 1 ? "s" : ""} + ${lb}m Long Break ${musicSuffix}`;
  }

  if (cfg.badge && title.length + cfg.badge.length + 5 <= 100) {
    title += ` [${cfg.badge}]`;
  }
  return title.slice(0, 100);
}

// ── Build all video specs for catalog/batch ──
export function buildAllVideoSpecs(): VideoSpec[] {
  const specs: VideoSpec[] = [];
  const audioModes: AudioMode[] = ["silent", "music", "ambient"];
  const themes: MusicTheme[] = ["default", "lofi", "rain", "piano", "nature", "ocean"];

  for (const cfg of POMODORO_CONFIGS) {
    for (const theme of themes) {
      for (const amode of audioModes) {
        // Sprint mode
        for (const spr of SPRINT_LEVELS) {
          const numBreaks = Math.max(0, spr - 1);
          const totalMin = spr * cfg.workMin + numBreaks * cfg.breakMin;
          const totalSec = INTRO_DURATION + totalMin * 60 + END_DURATION;
          if (totalSec > MAX_VIDEO_SEC) continue;

          specs.push({
            mode: "sprint",
            config: cfg,
            sprint: spr,
            theme,
            themeLabel: MUSIC_THEMES[theme].label,
            audioMode: amode,
            audioModeLabel: AUDIO_MODES[amode].label,
            filename: buildSprintFilename(cfg.id, spr, theme, amode),
            totalMin,
            focusMin: spr * cfg.workMin,
            totalSec,
          });
        }

        // Cycle mode
        for (const cyc of CYCLE_COUNTS) {
          for (const lb of LONG_BREAK_OPTIONS) {
            const totalMin = cyc * (POMODOROS_PER_CYCLE * (cfg.workMin + cfg.breakMin) + lb);
            const totalSec = INTRO_DURATION + totalMin * 60 + END_DURATION;
            if (totalSec > MAX_VIDEO_SEC) continue;

            specs.push({
              mode: "cycle",
              config: cfg,
              cycles: cyc,
              longBreak: lb,
              theme,
              themeLabel: MUSIC_THEMES[theme].label,
              audioMode: amode,
              audioModeLabel: AUDIO_MODES[amode].label,
              filename: buildCycleFilename(cfg.id, cyc, lb, theme, amode),
              totalMin,
              focusMin: cyc * POMODOROS_PER_CYCLE * cfg.workMin,
              totalSec,
            });
          }
        }
      }
    }
  }

  return specs;
}

// ── Get segment at a given frame ──
export function getSegmentAtFrame(
  segments: PhaseSegment[],
  frame: number,
  fps: number
): { segment: PhaseSegment; frameInSegment: number; segmentIndex: number; overallProgress: number } | null {
  let totalFrames = 0;
  const grandTotal = segments.reduce((a, s) => a + s.durationSec, 0) * fps;

  for (let i = 0; i < segments.length; i++) {
    const segFrames = segments[i].durationSec * fps;
    if (frame < totalFrames + segFrames) {
      // Calculate overall progress (excluding intro and end)
      const introFrames = segments[0].durationSec * fps;
      const endFrames = segments[segments.length - 1].durationSec * fps;
      const contentTotal = grandTotal - introFrames - endFrames;
      const contentElapsed = Math.max(0, frame - introFrames);
      const overallProgress = contentTotal > 0 ? Math.min(1, contentElapsed / contentTotal) : 0;

      return {
        segment: segments[i],
        frameInSegment: frame - totalFrames,
        segmentIndex: i,
        overallProgress,
      };
    }
    totalFrames += segFrames;
  }
  return null;
}

// ── Count completed focus sessions before a given segment index ──
export function countCompletedFocus(segments: PhaseSegment[], currentIndex: number): number {
  let count = 0;
  for (let i = 0; i < currentIndex; i++) {
    if (segments[i].phase === "focus") count++;
  }
  return count;
}
