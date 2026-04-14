// ═══════════════════════════════════════════════════════════════
// NoMore5Mins Pomodoro — Configuration v3
// Palette matched to hybrid thumbnail design
// ═══════════════════════════════════════════════════════════════
import type {
  PomodoroConfig,
  PomodoroConfigId,
  AudioMode,
  MusicTheme,
} from "./types";

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const THUMB_W = 1280;
export const THUMB_H = 720;
export const INTRO_DURATION = 7;
export const END_DURATION = 7;
export const MAX_VIDEO_SEC = 43199;

// ── COLORS — matched to thumbnail palette ──
export const COLORS = {
  // Backgrounds
  BG:            "#0A0E1E",
  BG_FOCUS:      "#0A0E1E",
  BG_BREAK:      "#071A18",
  BG_LONG_BREAK: "#0C1018",
  // Radial gradient centers (for depth)
  BG_FOCUS_CENTER:  "#161E3A",
  BG_BREAK_CENTER:  "#0F3530",
  BG_LONG_CENTER:   "#1A1030",
  // Accents — brighter to match thumbnail
  ACCENT_ORANGE: "#FFB840",
  ACCENT_TEAL:   "#2EEAAD",
  ACCENT_PURPLE: "#B388FF",
  // Top bar orange
  BAR_ORANGE:    "#E88A00",
  BAR_ORANGE_R:  "#FF9E1A",
  // Text
  TEXT_WHITE:    "#FFFFFF",
  TEXT_DIM:      "#646E8C",
  TEXT_SOFT:     "#A0AAC8",
  // Alerts
  RED_ALERT:     "#FF4444",
  GREEN_SUCCESS: "#22C55E",
  // UI elements
  PROGRESS_BG:   "#1E2337",
  RING_BG:       "#232840",
  CTA_RED:       "#FF3C3C",
  PILL_BG:       "#162030",
} as const;

// ── Glow helpers ──
export const GLOW = {
  ORANGE: "0 0 60px rgba(255,184,64,0.35), 0 4px 8px rgba(0,0,0,0.4)",
  TEAL:   "0 0 60px rgba(46,234,173,0.35), 0 4px 8px rgba(0,0,0,0.4)",
  PURPLE: "0 0 60px rgba(179,136,255,0.35), 0 4px 8px rgba(0,0,0,0.4)",
  RED:    "0 0 30px rgba(255,68,68,0.5)",
  GREEN:  "0 0 30px rgba(34,197,94,0.5)",
  RING_ORANGE: "drop-shadow(0 0 16px rgba(255,184,64,0.5))",
  RING_TEAL:   "drop-shadow(0 0 16px rgba(46,234,173,0.5))",
  RING_PURPLE: "drop-shadow(0 0 16px rgba(179,136,255,0.5))",
} as const;

// ── POMODORO CONFIGS ──
export const POMODORO_CONFIGS: PomodoroConfig[] = [
  { id: "15-3",  workMin: 15, breakMin: 3,  label: "15/3",  description: "Quick Sprint — ADHD Friendly",          badge: "ADHD-Friendly" },
  { id: "20-4",  workMin: 20, breakMin: 4,  label: "20/4",  description: "Short Focus — Attention Reboot",        badge: "Quick Focus" },
  { id: "25-5",  workMin: 25, breakMin: 5,  label: "25/5",  description: "Classic Pomodoro",                      badge: "Classic" },
  { id: "30-10", workMin: 30, breakMin: 10, label: "30/10", description: "Extended Focus",                        badge: "Extended" },
  { id: "40-10", workMin: 40, breakMin: 10, label: "40/10", description: "Deep Study Session",                    badge: "Deep Study" },
  { id: "45-15", workMin: 45, breakMin: 15, label: "45/15", description: "Pro Study Block",                       badge: "Pro Block" },
  { id: "50-10", workMin: 50, breakMin: 10, label: "50/10", description: "Power Focus",                           badge: "Power Mode" },
  { id: "52-17", workMin: 52, breakMin: 17, label: "52/17", description: "Golden Ratio — Science-Backed Optimal", badge: "Science-Backed" },
  { id: "90-20", workMin: 90, breakMin: 20, label: "90/20", description: "Ultradian Deep Work",                   badge: "Deep Work" },
];

export const SPRINT_LEVELS = [1, 2, 3, 4, 5, 6, 8, 10] as const;
export const CYCLE_COUNTS = [1, 2, 3] as const;
export const LONG_BREAK_OPTIONS = [15, 20, 30] as const;
export const POMODOROS_PER_CYCLE = 4;

export const AUDIO_MODES: Record<AudioMode, { label: string; focusVol: number; breakVol: number }> = {
  silent:  { label: "Silent Focus",  focusVol: 0.0,  breakVol: 0.65 },
  music:   { label: "Study Music",   focusVol: 0.35, breakVol: 0.65 },
  ambient: { label: "Ambient",       focusVol: 0.50, breakVol: 0.50 },
};

export const MUSIC_THEMES: Record<MusicTheme, { label: string; suffix: string; file: string }> = {
  default: { label: "Calm Music",    suffix: "",        file: "break_music/default.mp3" },
  lofi:    { label: "Lo-Fi Music",   suffix: "lofi",    file: "break_music/lofi.mp3" },
  rain:    { label: "Rain Sounds",   suffix: "rain",    file: "break_music/rain.mp3" },
  piano:   { label: "Piano Music",   suffix: "piano",   file: "break_music/piano.mp3" },
  nature:  { label: "Nature Sounds", suffix: "nature",  file: "break_music/nature.mp3" },
  ocean:   { label: "Ocean Waves",   suffix: "ocean",   file: "break_music/ocean.mp3" },
};

export const FOCUS_PHRASES = [
  "Lock in.", "Deep focus.", "You got this.", "Let's go.", "Grind time.",
  "Stay sharp.", "Crush it.", "Game on.", "Zero distractions.", "Go mode.",
  "All in.", "No excuses.", "Get after it.", "Laser focus.", "Eyes on the prize.",
  "Time to execute.", "Built different.", "Make it count.", "Locked in.",
  "Full send.", "Flow state.", "Own it.", "Dial in.", "Heads down.", "Beast mode.",
];

export const BREAK_PHRASES = [
  "You earned it.", "Take a breather.", "Recharge mode.", "Rest up, champ.",
  "Stretch it out.", "Breathe easy.", "Quick reset.", "Nice work!",
  "Relax & recharge.", "Well deserved.", "Hydrate & chill.", "Reset your mind.",
  "Almost there.", "Good stuff.", "Stand up, move around.", "Decompress.",
  "Quick refresh.", "Eyes off screen.",
];

export const LONG_BREAK_PHRASES = [
  "Big break. You've earned it.", "Longer rest. Come back stronger.",
  "Walk around. Stretch. Hydrate.", "Step away. Reset completely.",
  "Reward yourself. You crushed it.", "Full recharge mode.",
];

export const CTA_PHRASES = [
  "Enjoying this session? Hit Subscribe & Like!",
  "Stay focused. Subscribe for more timers!",
  "Like this timer? Tap Subscribe!",
  "Don't forget to Subscribe & Like!",
  "This helped? Subscribe & share!",
  "Smash that Like button!",
];

export const SITE_URL = "nomore5mins.com";

export function getConfig(id: PomodoroConfigId): PomodoroConfig {
  const cfg = POMODORO_CONFIGS.find((c) => c.id === id);
  if (!cfg) throw new Error(`Unknown config: ${id}`);
  return cfg;
}
