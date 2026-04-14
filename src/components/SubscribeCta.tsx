import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FPS } from "../config";

interface SubscribeCtaProps {
  /** "full" = Subscribe + Like + Bell row, "compact" = just Subscribe pill */
  variant?: "full" | "compact";
  /** optional text override below buttons */
  subtext?: string;
}

/**
 * Visual Subscribe & Like CTA with YouTube-style icons.
 * Animated pulse, glow effects, no plain text — pure visual.
 */
export const SubscribeCta: React.FC<SubscribeCtaProps> = ({
  variant = "full",
  subtext,
}) => {
  const frame = useCurrentFrame();

  // Pulse animation
  const pulse = interpolate(frame % (FPS * 2), [0, FPS, FPS * 2], [1, 1.06, 1], {
    extrapolateRight: "clamp",
  });

  // Bell wiggle
  const bellRotate = interpolate(
    frame % (FPS * 3),
    [0, FPS * 0.1, FPS * 0.2, FPS * 0.3, FPS * 0.4, FPS * 0.5],
    [0, 12, -10, 8, -4, 0],
    { extrapolateRight: "clamp" }
  );

  // Like bounce
  const likeBounce = interpolate(
    frame % (FPS * 2.5),
    [0, FPS * 0.15, FPS * 0.3],
    [0, -6, 0],
    { extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        transform: `scale(${pulse})`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: variant === "full" ? 20 : 14 }}>
        {/* ── SUBSCRIBE BUTTON ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "#FF0000",
            padding: variant === "full" ? "14px 32px" : "10px 24px",
            borderRadius: 8,
            boxShadow: "0 0 24px rgba(255,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {/* Play triangle icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="white" fillOpacity="0.2" />
            <path d="M9.5 7L16.5 12L9.5 17V7Z" fill="white" />
          </svg>
          <span
            style={{
              color: "white",
              fontSize: variant === "full" ? 28 : 22,
              fontWeight: 900,
              fontFamily: "Inter, Arial, sans-serif",
              letterSpacing: 1,
            }}
          >
            SUBSCRIBE
          </span>
        </div>

        {variant === "full" && (
          <>
            {/* ── LIKE BUTTON ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: COLORS.PILL_BG,
                border: `2px solid ${COLORS.TEXT_DIM}50`,
                padding: "12px 26px",
                borderRadius: 8,
                transform: `translateY(${likeBounce}px)`,
              }}
            >
              {/* Thumbs up SVG */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 22H4C3.45 22 2.98 21.8 2.59 21.41C2.2 21.02 2 20.55 2 20V13C2 12.45 2.2 11.98 2.59 11.59C2.98 11.2 3.45 11 4 11H7M14 9V5C14 4.2 13.68 3.52 13.12 3.05C12.55 2.58 11.87 2.35 11.07 2.35L7 11V22H18.28C18.86 22.01 19.36 21.81 19.78 21.42C20.2 21.02 20.44 20.51 20.5 19.94L21.47 12.94C21.51 12.59 21.47 12.25 21.35 11.93C21.23 11.61 21.04 11.33 20.8 11.1C20.55 10.87 20.27 10.7 19.95 10.59C19.63 10.48 19.3 10.44 18.96 10.47H14Z"
                  fill="white"
                />
              </svg>
              <span
                style={{
                  color: "white",
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "Inter, Arial, sans-serif",
                }}
              >
                LIKE
              </span>
            </div>

            {/* ── BELL ICON ── */}
            <div
              style={{
                backgroundColor: COLORS.PILL_BG,
                border: `2px solid ${COLORS.TEXT_DIM}50`,
                padding: "12px 16px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `rotate(${bellRotate}deg)`,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 8C18 6.4 17.36 4.88 16.24 3.76C15.12 2.64 13.6 2 12 2C10.4 2 8.88 2.64 7.76 3.76C6.64 4.88 6 6.4 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                  fill={COLORS.ACCENT_ORANGE}
                />
                <path
                  d="M13.73 21C13.55 21.34 13.28 21.61 12.96 21.79C12.64 21.97 12.27 22.07 11.9 22.07C11.53 22.07 11.16 21.97 10.84 21.79C10.52 21.61 10.25 21.34 10.07 21"
                  stroke={COLORS.ACCENT_ORANGE}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </>
        )}
      </div>

      {/* Optional subtext */}
      {subtext && (
        <div
          style={{
            color: COLORS.TEXT_DIM,
            fontSize: 20,
            fontWeight: 500,
            fontFamily: "Inter, Arial, sans-serif",
            marginTop: 4,
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};
