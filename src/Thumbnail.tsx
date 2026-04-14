import React from "react";
import { Img, staticFile } from "remotion";
import type { VideoProps } from "./types";
import {
  THUMB_W,
  THUMB_H,
  POMODOROS_PER_CYCLE,
  MUSIC_THEMES,
  AUDIO_MODES,
  SITE_URL,
  getConfig,
} from "./config";

// ── PALETTE v3 — more contrast between panels ──
const T = {
  TOP_LEFT: "#E88A00",
  TOP_RIGHT: "#FF9E1A",
  // WORK panel — deep navy with subtle warmth
  WORK_BG_CENTER: "#161E3A",
  WORK_BG_EDGE: "#0A0E1E",
  // BREAK panel — visibly teal-tinted, clearly different
  BREAK_BG_CENTER: "#0F3530",
  BREAK_BG_EDGE: "#071A18",
  // Accents
  ORANGE: "#FFB840",
  ORANGE_DARK: "#D47800",
  ORANGE_DEEP: "#FF7A1A",
  TEAL: "#2EEAAD",
  PURPLE: "#B388FF",
  WHITE: "#FFFFFF",
  // Bottom bar
  BOT_BG: "#0A0E1E",
  BOT_BORDER: "#FF9E1A",
  PILL_BG: "#162030",
  // Badge backgrounds
  BADGE_DARK: "rgba(0,0,0,0.30)",
  BADGE_ORANGE: "#E88A00",
} as const;

/**
 * Thumbnail v3 — Final Production Version
 * =========================================
 * - Giant centered POMODORO in orange bar
 * - Bigger WORK/BREAK labels (36px) and "min" (32px)
 * - More distinct panel backgrounds (BREAK visibly teal)
 * - Prominent ×2 SPRINT badge (bigger, bolder)
 * - Prominent Classic badge (solid background)
 * - Music theme front and center in bottom bar
 * - Duration big and bold
 * - Logo in top bar
 */
export const Thumbnail: React.FC<VideoProps> = (props) => {
  const cfg = getConfig(props.config);
  const themeInfo = MUSIC_THEMES[props.theme];
  const amodeInfo = AUDIO_MODES[props.audioMode];

  // ── Mode badge ──
  let modeBadge = "";
  if (props.mode === "cycle") {
    const cyc = props.cycles ?? 1;
    modeBadge = `${cyc} CYCLE${cyc > 1 ? "S" : ""}`;
  } else if ((props.sprint ?? 1) > 1) {
    modeBadge = `×${props.sprint} SPRINT`;
  }

  // ── Total duration ──
  let totalMin: number;
  if (props.mode === "cycle") {
    const cyc = props.cycles ?? 1;
    const lb = props.longBreak ?? 15;
    totalMin = cyc * (POMODOROS_PER_CYCLE * (cfg.workMin + cfg.breakMin) + lb);
  } else {
    const spr = props.sprint ?? 1;
    const numBreaks = Math.max(0, spr - 1);
    totalMin = spr * cfg.workMin + numBreaks * cfg.breakMin;
  }
  const durText =
    totalMin >= 60
      ? totalMin % 60 === 0
        ? `${Math.floor(totalMin / 60)}h`
        : `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
      : `${totalMin} min`;

  // ── Music label for display ──
  const musicDisplay = themeInfo.label || "Calm Music";
  // Audio mode qualifier
  let musicPrefix = "♪";
  if (props.audioMode === "music") musicPrefix = "🎵";
  if (props.audioMode === "ambient") musicPrefix = "🌊";

  // ── Layout ──
  const topBarH = 90;
  const botBarH = 76;
  const splitH = THUMB_H - topBarH - botBarH;
  const halfW = THUMB_W / 2;
  const divW = 6;

  return (
    <div
      style={{
        width: THUMB_W,
        height: THUMB_H,
        position: "relative",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ══════════ TOP BAR — Orange gradient ══════════ */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: THUMB_W,
          height: topBarH,
          background: `linear-gradient(90deg, ${T.TOP_LEFT} 0%, ${T.TOP_RIGHT} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        {/* Mode badge — LEFT (bigger, bolder) */}
        {modeBadge && (
          <div
            style={{
              position: "absolute",
              left: 24,
              backgroundColor: T.WHITE,
              color: T.ORANGE_DARK,
              fontSize: 26,
              fontWeight: 900,
              padding: "8px 20px",
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              letterSpacing: 1,
            }}
          >
            {modeBadge}
          </div>
        )}

        {/* POMODORO — CENTER, giant */}
        <div
          style={{
            color: T.WHITE,
            fontWeight: 900,
            fontSize: 50,
            letterSpacing: 12,
            textShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          POMODORO
        </div>

        {/* Config badge — RIGHT (solid, prominent) */}
        {cfg.badge && (
          <div
            style={{
              position: "absolute",
              right: 24,
              backgroundColor: T.WHITE,
              color: T.BADGE_ORANGE,
              fontSize: 22,
              fontWeight: 900,
              padding: "8px 18px",
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            {cfg.badge}
          </div>
        )}
      </div>

      {/* ══════════ WORK PANEL — Left ══════════ */}
      <div
        style={{
          position: "absolute",
          top: topBarH,
          left: 0,
          width: halfW - divW / 2,
          height: splitH,
          background: `radial-gradient(ellipse at 50% 55%, ${T.WORK_BG_CENTER} 0%, ${T.WORK_BG_EDGE} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: T.ORANGE,
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: 14,
            marginBottom: 2,
          }}
        >
          WORK
        </div>
        <div
          style={{
            color: T.WHITE,
            fontSize: 230,
            fontWeight: 900,
            lineHeight: 0.85,
            textShadow:
              "0 0 60px rgba(255,184,64,0.4), 0 4px 8px rgba(0,0,0,0.5)",
          }}
        >
          {cfg.workMin}
        </div>
        <div
          style={{
            color: T.ORANGE,
            fontSize: 32,
            fontWeight: 800,
            marginTop: 6,
          }}
        >
          min
        </div>
      </div>

      {/* ══════════ GRADIENT DIVIDER ══════════ */}
      <div
        style={{
          position: "absolute",
          top: topBarH,
          left: halfW - divW / 2,
          width: divW,
          height: splitH,
          background: `linear-gradient(180deg, ${T.ORANGE} 0%, ${T.ORANGE_DEEP} 100%)`,
          boxShadow: "0 0 24px rgba(255,184,64,0.5)",
        }}
      />

      {/* ══════════ BREAK PANEL — Right (visibly teal) ══════════ */}
      <div
        style={{
          position: "absolute",
          top: topBarH,
          left: halfW + divW / 2,
          width: halfW - divW / 2,
          height: splitH,
          background: `radial-gradient(ellipse at 50% 55%, ${T.BREAK_BG_CENTER} 0%, ${T.BREAK_BG_EDGE} 100%)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: T.TEAL,
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: 14,
            marginBottom: 2,
          }}
        >
          BREAK
        </div>
        <div
          style={{
            color: T.WHITE,
            fontSize: 230,
            fontWeight: 900,
            lineHeight: 0.85,
            textShadow:
              "0 0 60px rgba(46,234,173,0.4), 0 4px 8px rgba(0,0,0,0.5)",
          }}
        >
          {cfg.breakMin}
        </div>
        <div
          style={{
            color: T.TEAL,
            fontSize: 32,
            fontWeight: 800,
            marginTop: 6,
          }}
        >
          min
        </div>

        {/* Long break — cycle mode */}
        {props.mode === "cycle" && props.longBreak && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              color: T.PURPLE,
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            +{props.longBreak}m long break
          </div>
        )}
      </div>

      {/* ══════════ BOTTOM BAR ══════════ */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: THUMB_W,
          height: botBarH,
          backgroundColor: T.BOT_BG,
          borderTop: `4px solid ${T.BOT_BORDER}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
        }}
      >
        {/* Logo */}
        <Img
          src={staticFile("logo.png")}
          style={{ height: 36, marginRight: 16 }}
          onError={() => {}}
        />

        {/* Duration — big and bold */}
        <div style={{ color: T.WHITE, fontSize: 34, fontWeight: 900 }}>
          {durText}
        </div>

        {/* Audio mode badge — non-silent */}
        {props.audioMode !== "silent" && (
          <div
            style={{
              marginLeft: 16,
              backgroundColor: T.PILL_BG,
              color: T.ORANGE,
              fontSize: 20,
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 6,
              border: `1px solid ${T.ORANGE}40`,
            }}
          >
            {amodeInfo.label}
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Music theme — prominent center-right pill */}
        <div
          style={{
            backgroundColor: T.TEAL,
            color: T.BOT_BG,
            fontSize: 22,
            fontWeight: 900,
            padding: "8px 20px",
            borderRadius: 8,
            marginRight: 20,
            boxShadow: `0 0 14px ${T.TEAL}50`,
          }}
        >
          {musicPrefix} {musicDisplay}
        </div>

        {/* Site URL */}
        <div style={{ color: T.ORANGE, fontSize: 20, fontWeight: 800 }}>
          {SITE_URL}
        </div>
      </div>
    </div>
  );
};
