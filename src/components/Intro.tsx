import React from "react";
import { interpolate, spring, Img, staticFile, useVideoConfig } from "remotion";
import { COLORS, GLOW, FPS, SITE_URL } from "../config";
import { SubscribeCta } from "./SubscribeCta";

interface IntroProps {
  frameInSegment: number;
  durationSec: number;
  workMin: number;
  breakMin: number;
  modeLabel: string;
  themeLabel: string;
  badge: string;
}

export const Intro: React.FC<IntroProps> = ({
  frameInSegment,
  durationSec,
  workMin,
  breakMin,
  modeLabel,
  themeLabel,
  badge,
}) => {
  const { fps } = useVideoConfig();
  const sec = frameInSegment / FPS;
  const remaining = durationSec - Math.floor(sec);
  const showCountdown = remaining <= 5 && remaining > 0;

  const enter = spring({ frame: frameInSegment, fps, config: { damping: 20, stiffness: 100 } });
  const titleEnter = spring({ frame: Math.max(0, frameInSegment - 5), fps, config: { damping: 18, stiffness: 80 } });
  const subtitleEnter = spring({ frame: Math.max(0, frameInSegment - 12), fps, config: { damping: 18, stiffness: 80 } });
  const ctaEnter = spring({ frame: Math.max(0, frameInSegment - 20), fps, config: { damping: 18, stiffness: 80 } });

  const countdownPop = showCountdown
    ? spring({ frame: frameInSegment % FPS, fps, config: { damping: 12, stiffness: 200 } })
    : 1;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: `radial-gradient(ellipse at 50% 40%, ${COLORS.BG_FOCUS_CENTER} 0%, ${COLORS.BG} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Orange accent top */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 6, background: `linear-gradient(90deg, ${COLORS.BAR_ORANGE}, ${COLORS.BAR_ORANGE_R})` }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 24, left: 40 }}>
        <Img src={staticFile("logo.png")} style={{ height: 48 }} onError={() => {}} />
      </div>

      {/* Badge */}
      {badge && (
        <div style={{ position: "absolute", top: 28, right: 40, backgroundColor: COLORS.ACCENT_ORANGE, color: COLORS.BG, fontSize: 22, fontWeight: 900, padding: "6px 18px", borderRadius: 8, boxShadow: `0 0 16px ${COLORS.ACCENT_ORANGE}50` }}>
          {badge}
        </div>
      )}

      {/* POMODORO TIMER */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: COLORS.ACCENT_ORANGE,
          letterSpacing: 10,
          textShadow: GLOW.ORANGE,
          transform: `scale(${interpolate(titleEnter, [0, 1], [0.8, 1])})`,
          opacity: titleEnter,
          marginBottom: 12,
        }}
      >
        POMODORO TIMER
      </div>

      {/* Divider */}
      <div style={{ width: 500, height: 3, background: `linear-gradient(90deg, transparent, ${COLORS.ACCENT_ORANGE}60, transparent)`, marginBottom: 24, opacity: enter }} />

      {/* Mode label */}
      <div style={{ fontSize: 30, fontWeight: 500, color: COLORS.TEXT_DIM, opacity: subtitleEnter, transform: `translateY(${interpolate(subtitleEnter, [0, 1], [15, 0])}px)`, marginBottom: 28 }}>
        {modeLabel}
      </div>

      {/* Welcome */}
      <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.TEXT_WHITE, textShadow: "0 2px 8px rgba(0,0,0,0.3)", textAlign: "center", lineHeight: 1.6, opacity: subtitleEnter, marginBottom: 8 }}>
        Your focus journey starts now.
      </div>
      <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.TEXT_WHITE, textShadow: "0 2px 8px rgba(0,0,0,0.3)", marginBottom: 20, opacity: subtitleEnter }}>
        Let's make every minute count.
      </div>

      {/* Theme */}
      {themeLabel && (
        <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.ACCENT_TEAL, textShadow: `0 0 20px ${COLORS.ACCENT_TEAL}30`, marginBottom: 24, opacity: subtitleEnter }}>
          ♪ {themeLabel}
        </div>
      )}

      {/* Visual CTA — replaces plain text */}
      {!showCountdown && (
        <div style={{ opacity: ctaEnter, transform: `translateY(${interpolate(ctaEnter, [0, 1], [20, 0])}px)` }}>
          <SubscribeCta variant="full" />
        </div>
      )}

      {/* Countdown */}
      {showCountdown && (
        <div
          style={{
            fontSize: 100,
            fontWeight: 300,
            color: COLORS.TEXT_WHITE,
            textShadow: GLOW.ORANGE,
            transform: `scale(${interpolate(countdownPop, [0, 1], [1.3, 1])})`,
          }}
        >
          {remaining}
        </div>
      )}

      <div style={{ position: "absolute", bottom: 30, right: 50, fontSize: 24, fontWeight: 700, color: COLORS.ACCENT_ORANGE }}>
        {SITE_URL}
      </div>
    </div>
  );
};
