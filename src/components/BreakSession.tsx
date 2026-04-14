import React from "react";
import { Img, staticFile, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, GLOW, FPS, SITE_URL, CTA_PHRASES } from "../config";
import { formatTime } from "../utils";
import { CircularProgress } from "./CircularProgress";
import { SessionDots } from "./SessionDots";
import { ProgressBar } from "./ProgressBar";
import { MotivationalText } from "./MotivationalText";
import { CtaBanner } from "./CtaBanner";

interface BreakSessionProps {
  frameInSegment: number;
  durationSec: number;
  sessionIndex: number;
  totalSessions: number;
  overallProgress: number;
  phrase: string;
  completedSessions: number;
  isLong?: boolean;
}

export const BreakSession: React.FC<BreakSessionProps> = ({
  frameInSegment,
  durationSec,
  sessionIndex,
  totalSessions,
  overallProgress,
  phrase,
  completedSessions,
  isLong = false,
}) => {
  const { fps } = useVideoConfig();
  const sec = frameInSegment / FPS;
  const remaining = Math.max(0, durationSec - Math.floor(sec));
  const progress = sec / durationSec;
  const isCountdown = remaining > 0 && remaining <= 10;

  // Color scheme
  const bgCenter = isLong ? COLORS.BG_LONG_CENTER : COLORS.BG_BREAK_CENTER;
  const bgEdge = isLong ? COLORS.BG_LONG_BREAK : COLORS.BG_BREAK;
  const accent = isLong ? COLORS.ACCENT_PURPLE : COLORS.ACCENT_TEAL;
  const ringGlow = isLong ? GLOW.RING_PURPLE : GLOW.RING_TEAL;
  const textGlow = isLong ? GLOW.PURPLE : GLOW.TEAL;
  const label = isLong ? "L O N G   B R E A K" : "B R E A K";
  const topAccent = isLong ? COLORS.ACCENT_PURPLE : COLORS.ACCENT_TEAL;

  // Timer color
  const timerFlash = isCountdown && Math.floor(sec) % 2 === 0;
  const timerColor = isCountdown
    ? timerFlash ? COLORS.RED_ALERT : COLORS.ACCENT_ORANGE
    : COLORS.TEXT_WHITE;
  const timerShadow = isCountdown ? GLOW.RED : "0 2px 4px rgba(0,0,0,0.3)";

  // CTA
  const showCta = sec > 5 && remaining > 15;
  const ctaText = CTA_PHRASES[sessionIndex % CTA_PHRASES.length];

  // Countdown beep visual flash
  const beepFlash = isCountdown
    ? interpolate(frameInSegment % FPS, [0, 4, 8], [0.15, 0, 0], { extrapolateRight: "clamp" })
    : 0;

  const enterOpacity = interpolate(frameInSegment, [0, FPS * 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at 50% 45%, ${bgCenter} 0%, ${bgEdge} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "Inter, Arial, sans-serif",
        position: "relative",
        opacity: enterOpacity,
      }}
    >
      {/* Beep flash overlay */}
      {beepFlash > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(255,68,68,${beepFlash})`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />
      )}

      {/* Accent line top */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, backgroundColor: topAccent, boxShadow: `0 0 12px ${topAccent}50` }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 24, left: 40 }}>
        <Img src={staticFile("logo.png")} style={{ height: 44 }} onError={() => {}} />
      </div>

      {/* Phase label */}
      <div
        style={{
          marginTop: 50,
          fontSize: isLong ? 36 : 40,
          fontWeight: 900,
          color: accent,
          letterSpacing: isLong ? 10 : 16,
          textShadow: `0 0 24px ${accent}40`,
        }}
      >
        {label}
      </div>

      {/* Motivational text */}
      <div style={{ height: 72, display: "flex", alignItems: "center", marginTop: 8 }}>
        <MotivationalText
          text={phrase}
          frameInSegment={frameInSegment}
          color={accent}
          fontSize={isLong ? 42 : 48}
          durationSec={isLong ? 4 : 3}
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
        }}
      >
        <CircularProgress
          progress={progress}
          accentColor={accent}
          glowFilter={ringGlow}
          size={440}
          strokeWidth={16}
        />
        <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              fontSize: remaining >= 3600 ? 88 : 120,
              fontWeight: 200,
              color: timerColor,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: 6,
              textShadow: timerShadow,
            }}
          >
            {formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Label */}
      <div style={{ fontSize: 22, fontWeight: 500, color: COLORS.TEXT_DIM, marginTop: 18 }}>
        {isLong ? "Long Break" : `Break ${sessionIndex + 1}`}
      </div>

      {/* Dots */}
      <div style={{ marginTop: 16 }}>
        <SessionDots total={totalSessions} current={sessionIndex} completed={completedSessions} />
      </div>

      {/* "Get ready to focus!" */}
      {isCountdown && (
        <div
          style={{
            position: "absolute",
            bottom: 140,
            fontSize: 30,
            fontWeight: 800,
            color: COLORS.RED_ALERT,
            textShadow: GLOW.RED,
            opacity: interpolate(frameInSegment % FPS, [0, FPS / 2, FPS], [1, 0.6, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Get ready to focus!
        </div>
      )}

      <CtaBanner text={ctaText} visible={showCta && !isCountdown} />
      <ProgressBar progress={overallProgress} accentColor={accent} />

      <div style={{ position: "absolute", bottom: 28, right: 50, fontSize: 24, fontWeight: 700, color: COLORS.ACCENT_ORANGE }}>
        {SITE_URL}
      </div>
    </div>
  );
};
