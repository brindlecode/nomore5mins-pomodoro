import React from "react";
import { Img, staticFile, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, GLOW, FPS, SITE_URL } from "../config";
import { ProgressBar } from "./ProgressBar";
import { SubscribeCta } from "./SubscribeCta";

interface EndScreenProps {
  frameInSegment: number;
  durationSec: number;
  focusTotalMin: number;
  totalMin: number;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  frameInSegment,
  durationSec,
  focusTotalMin,
  totalMin,
}) => {
  const { fps } = useVideoConfig();

  const checkPop = spring({ frame: frameInSegment, fps, config: { damping: 10, stiffness: 150, mass: 0.6 } });
  const titleEnter = spring({ frame: Math.max(0, frameInSegment - 8), fps, config: { damping: 18, stiffness: 100 } });
  const statsEnter = spring({ frame: Math.max(0, frameInSegment - 16), fps, config: { damping: 18, stiffness: 100 } });
  const ctaEnter = spring({ frame: Math.max(0, frameInSegment - 24), fps, config: { damping: 18, stiffness: 100 } });

  const glowScale = interpolate(checkPop, [0, 1], [0.5, 1]);
  const glowOpacity = interpolate(frameInSegment, [0, FPS * 0.5, FPS * 2], [0, 0.8, 0.3], { extrapolateRight: "clamp" });

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
      {/* Green accent top */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, backgroundColor: COLORS.GREEN_SUCCESS, boxShadow: `0 0 12px ${COLORS.GREEN_SUCCESS}50` }} />

      {/* Logo */}
      <div style={{ position: "absolute", top: 24, left: 40 }}>
        <Img src={staticFile("logo.png")} style={{ height: 44 }} onError={() => {}} />
      </div>

      {/* Glow ring */}
      <div
        style={{
          width: 160,
          height: 160,
          borderRadius: "50%",
          backgroundColor: `${COLORS.GREEN_SUCCESS}15`,
          boxShadow: `0 0 80px ${COLORS.GREEN_SUCCESS}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${glowScale})`,
          opacity: glowOpacity,
          marginBottom: -140,
        }}
      />

      {/* Checkmark */}
      <div
        style={{
          fontSize: 90,
          color: COLORS.GREEN_SUCCESS,
          transform: `scale(${interpolate(checkPop, [0, 1], [0, 1.1])})`,
          textShadow: GLOW.GREEN,
          marginBottom: 28,
          zIndex: 1,
        }}
      >
        ✓
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 800,
          color: COLORS.TEXT_WHITE,
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
          opacity: titleEnter,
          transform: `translateY(${interpolate(titleEnter, [0, 1], [20, 0])}px)`,
          marginBottom: 20,
        }}
      >
        Session complete. You crushed it.
      </div>

      {/* Stats */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 500,
          color: COLORS.TEXT_DIM,
          opacity: statsEnter,
          transform: `translateY(${interpolate(statsEnter, [0, 1], [15, 0])}px)`,
          marginBottom: 36,
        }}
      >
        <span style={{ color: COLORS.ACCENT_ORANGE, fontWeight: 700 }}>{focusTotalMin}</span> minutes of pure focus  •  <span style={{ color: COLORS.ACCENT_TEAL, fontWeight: 700 }}>{totalMin}</span> minutes total
      </div>

      {/* Visual CTA */}
      <div
        style={{
          opacity: ctaEnter,
          transform: `translateY(${interpolate(ctaEnter, [0, 1], [20, 0])}px)`,
        }}
      >
        <SubscribeCta variant="full" subtext="Your support helps us create more focus tools!" />
      </div>

      <ProgressBar progress={1.0} accentColor={COLORS.GREEN_SUCCESS} />

      <div style={{ position: "absolute", bottom: 28, right: 50, fontSize: 24, fontWeight: 700, color: COLORS.ACCENT_ORANGE }}>
        {SITE_URL}
      </div>
    </div>
  );
};
