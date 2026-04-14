import React from "react";
import { Img, staticFile, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, GLOW, FPS, SITE_URL } from "../config";
import { formatTime } from "../utils";
import { CircularProgress } from "./CircularProgress";
import { SessionDots } from "./SessionDots";
import { ProgressBar } from "./ProgressBar";
import { MotivationalText } from "./MotivationalText";

interface FocusSessionProps {
  frameInSegment: number;
  durationSec: number;
  sessionIndex: number;
  totalSessions: number;
  overallProgress: number;
  phrase: string;
  completedSessions: number;
}

export const FocusSession: React.FC<FocusSessionProps> = ({
  frameInSegment,
  durationSec,
  sessionIndex,
  totalSessions,
  overallProgress,
  phrase,
  completedSessions,
}) => {
  const { fps } = useVideoConfig();
  const sec = frameInSegment / FPS;
  const remaining = Math.max(0, durationSec - Math.floor(sec));
  const progress = sec / durationSec;
  const isAlert = remaining > 0 && remaining <= 10;

  // Alert pulse
  const alertPulse = isAlert
    ? interpolate(frameInSegment % FPS, [0, FPS / 2, FPS], [1, 1.04, 1], { extrapolateRight: "clamp" })
    : 1;

  // Timer color
  const timerFlash = isAlert && Math.floor(sec) % 2 === 0;
  const timerColor = timerFlash ? COLORS.RED_ALERT : COLORS.TEXT_WHITE;
  const timerGlow = isAlert ? GLOW.RED : "0 2px 4px rgba(0,0,0,0.3)";

  // Entrance fade
  const enterOpacity = interpolate(frameInSegment, [0, FPS * 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at 50% 45%, ${COLORS.BG_FOCUS_CENTER} 0%, ${COLORS.BG_FOCUS} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, Arial, sans-serif",
        position: "relative",
        opacity: enterOpacity,
      }}
    >
      {/* Orange accent line top */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, background: `linear-gradient(90deg, ${COLORS.BAR_ORANGE}, ${COLORS.BAR_ORANGE_R})` }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 24, left: 40 }}>
        <Img src={staticFile("logo.png")} style={{ height: 44 }} onError={() => {}} />
      </div>

      {/* Phase label */}
      <div
        style={{
          marginTop: 50,
          fontSize: 40,
          fontWeight: 900,
          color: COLORS.ACCENT_ORANGE,
          letterSpacing: 16,
          textShadow: `0 0 24px ${COLORS.ACCENT_ORANGE}40`,
        }}
      >
        F O C U S
      </div>

      {/* Motivational text */}
      <div style={{ height: 72, display: "flex", alignItems: "center", marginTop: 8 }}>
        <MotivationalText
          text={phrase}
          frameInSegment={frameInSegment}
          color={COLORS.ACCENT_ORANGE}
          fontSize={48}
          durationSec={3}
        />
      </div>

      {/* Ring + Timer */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
          transform: `scale(${alertPulse})`,
        }}
      >
        <CircularProgress
          progress={progress}
          accentColor={COLORS.ACCENT_ORANGE}
          glowFilter={GLOW.RING_ORANGE}
          size={440}
          strokeWidth={16}
        />
        <div
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: remaining >= 3600 ? 88 : 120,
              fontWeight: 200,
              color: timerColor,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 6,
              textShadow: timerGlow,
            }}
          >
            {formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Session info */}
      <div style={{ fontSize: 22, fontWeight: 500, color: COLORS.TEXT_DIM, marginTop: 18 }}>
        Session {sessionIndex + 1} of {totalSessions}
      </div>

      {/* Dots */}
      <div style={{ marginTop: 16 }}>
        <SessionDots total={totalSessions} current={sessionIndex} completed={completedSessions} />
      </div>

      <ProgressBar progress={overallProgress} accentColor={COLORS.ACCENT_ORANGE} />

      <div style={{ position: "absolute", bottom: 28, right: 50, fontSize: 24, fontWeight: 700, color: COLORS.ACCENT_ORANGE }}>
        {SITE_URL}
      </div>
    </div>
  );
};
