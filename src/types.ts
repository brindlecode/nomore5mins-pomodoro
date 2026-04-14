// ═══════════════════════════════════════════════════════════════
// NoMore5Mins Pomodoro — Types
// ═══════════════════════════════════════════════════════════════

export type PomodoroConfigId =
  | "15-3" | "20-4" | "25-5" | "30-10"
  | "40-10" | "45-15" | "50-10" | "52-17" | "90-20";

export type AudioMode = "silent" | "music" | "ambient";

export type MusicTheme =
  | "default" | "lofi" | "rain" | "piano"
  | "nature" | "ocean";

export type VideoMode = "sprint" | "cycle";

export type Phase = "intro" | "focus" | "break" | "longBreak" | "end";

export interface PomodoroConfig {
  id: PomodoroConfigId;
  workMin: number;
  breakMin: number;
  label: string;
  description: string;
  badge: string;
}

export interface VideoProps {
  config: PomodoroConfigId;
  mode: VideoMode;
  sprint?: number;       // 1-10, for sprint mode
  cycles?: number;       // 1-3, for cycle mode
  longBreak?: number;    // 15/20/30 min, for cycle mode
  audioMode: AudioMode;
  theme: MusicTheme;
}

export interface ThumbnailProps extends VideoProps {}

export interface PhaseSegment {
  phase: Phase;
  durationSec: number;
  sessionIndex: number;     // which focus/break session (0-indexed)
  totalSessions: number;    // total focus sessions in video
  phrase: string;           // motivational text for this segment
  isLong?: boolean;         // for long breaks
}

export interface VideoTimeline {
  segments: PhaseSegment[];
  totalDurationSec: number;
  totalFocusMin: number;
  totalContentMin: number;
  filename: string;
  youtubeTitle: string;
}

export interface VideoSpec {
  mode: VideoMode;
  config: PomodoroConfig;
  sprint?: number;
  cycles?: number;
  longBreak?: number;
  theme: MusicTheme;
  themeLabel: string;
  audioMode: AudioMode;
  audioModeLabel: string;
  filename: string;
  totalMin: number;
  focusMin: number;
  totalSec: number;
}
