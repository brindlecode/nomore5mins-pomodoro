import React, { useMemo } from "react";
import { useCurrentFrame, Sequence } from "remotion";
import type { VideoProps } from "./types";
import { FPS, getConfig, MUSIC_THEMES, POMODOROS_PER_CYCLE } from "./config";
import { buildTimeline, countCompletedFocus } from "./utils";
import { Intro } from "./components/Intro";
import { FocusSession } from "./components/FocusSession";
import { BreakSession } from "./components/BreakSession";
import { EndScreen } from "./components/EndScreen";
import { AudioLayer } from "./audio/AudioLayer";

export const PomodoroVideo: React.FC<VideoProps> = (props) => {
  const timeline = useMemo(() => buildTimeline(props), [
    props.config,
    props.mode,
    props.sprint,
    props.cycles,
    props.longBreak,
    props.audioMode,
    props.theme,
  ]);

  const cfg = getConfig(props.config);
  const themeLabel = MUSIC_THEMES[props.theme].label;

  // Build mode label for intro
  const modeLabel = useMemo(() => {
    if (props.mode === "sprint") {
      const spr = props.sprint ?? 1;
      if (spr === 1) return `${cfg.workMin} min focus`;
      const numBreaks = Math.max(0, spr - 1);
      const totalMin = spr * cfg.workMin + numBreaks * cfg.breakMin;
      return `${spr}× ${cfg.workMin} min focus + ${numBreaks}× ${cfg.breakMin} min break = ${totalMin} min`;
    } else {
      const cyc = props.cycles ?? 1;
      const lb = props.longBreak ?? 15;
      return `${cyc} Cycle${cyc > 1 ? "s" : ""} × (${POMODOROS_PER_CYCLE}×${cfg.workMin}/${cfg.breakMin} + ${lb}m long break)`;
    }
  }, [props, cfg]);

  // Render segments using Sequence for each phase
  let frameOffset = 0;
  const sequences: React.ReactNode[] = [];

  for (let i = 0; i < timeline.segments.length; i++) {
    const seg = timeline.segments[i];
    const segFrames = seg.durationSec * FPS;
    const completedFocus = countCompletedFocus(timeline.segments, i);

    // Calculate overall progress for this segment
    const introFrames = timeline.segments[0].durationSec * FPS;
    const endFrames = timeline.segments[timeline.segments.length - 1].durationSec * FPS;
    const totalContentFrames = timeline.totalDurationSec * FPS - introFrames - endFrames;

    sequences.push(
      <Sequence key={`phase-${i}`} from={frameOffset} durationInFrames={segFrames}>
        <SegmentRenderer
          segment={seg}
          segmentIndex={i}
          timeline={timeline}
          cfg={cfg}
          themeLabel={themeLabel}
          modeLabel={modeLabel}
          completedFocus={completedFocus}
          introFrames={introFrames}
          totalContentFrames={totalContentFrames}
          frameOffset={frameOffset}
        />
      </Sequence>
    );

    frameOffset += segFrames;
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {sequences}
      <AudioLayer
        segments={timeline.segments}
        audioMode={props.audioMode}
        theme={props.theme}
      />
    </div>
  );
};

// ── Segment renderer ──
interface SegmentRendererProps {
  segment: import("./types").PhaseSegment;
  segmentIndex: number;
  timeline: import("./types").VideoTimeline;
  cfg: import("./types").PomodoroConfig;
  themeLabel: string;
  modeLabel: string;
  completedFocus: number;
  introFrames: number;
  totalContentFrames: number;
  frameOffset: number;
}

const SegmentRenderer: React.FC<SegmentRendererProps> = ({
  segment,
  segmentIndex,
  timeline,
  cfg,
  themeLabel,
  modeLabel,
  completedFocus,
  introFrames,
  totalContentFrames,
  frameOffset,
}) => {
  const frame = useCurrentFrame(); // frame within this Sequence

  // Calculate overall progress
  const globalFrame = frameOffset + frame;
  const contentElapsed = Math.max(0, globalFrame - introFrames);
  const overallProgress = totalContentFrames > 0 ? Math.min(1, contentElapsed / totalContentFrames) : 0;

  switch (segment.phase) {
    case "intro":
      return (
        <Intro
          frameInSegment={frame}
          durationSec={segment.durationSec}
          workMin={cfg.workMin}
          breakMin={cfg.breakMin}
          modeLabel={modeLabel}
          themeLabel={themeLabel}
          badge={cfg.badge}
        />
      );

    case "focus":
      return (
        <FocusSession
          frameInSegment={frame}
          durationSec={segment.durationSec}
          sessionIndex={segment.sessionIndex}
          totalSessions={segment.totalSessions}
          overallProgress={overallProgress}
          phrase={segment.phrase}
          completedSessions={completedFocus}
        />
      );

    case "break":
      return (
        <BreakSession
          frameInSegment={frame}
          durationSec={segment.durationSec}
          sessionIndex={segment.sessionIndex}
          totalSessions={segment.totalSessions}
          overallProgress={overallProgress}
          phrase={segment.phrase}
          completedSessions={completedFocus}
          isLong={false}
        />
      );

    case "longBreak":
      return (
        <BreakSession
          frameInSegment={frame}
          durationSec={segment.durationSec}
          sessionIndex={segment.sessionIndex}
          totalSessions={segment.totalSessions}
          overallProgress={overallProgress}
          phrase={segment.phrase}
          completedSessions={completedFocus}
          isLong={true}
        />
      );

    case "end":
      return (
        <EndScreen
          frameInSegment={frame}
          durationSec={segment.durationSec}
          focusTotalMin={timeline.totalFocusMin}
          totalMin={timeline.totalContentMin}
        />
      );

    default:
      return null;
  }
};
