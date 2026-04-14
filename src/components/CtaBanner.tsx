import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, FPS } from "../config";

interface CtaBannerProps {
  text: string;
  visible: boolean;
}

/**
 * Break CTA — compact visual subscribe + like reminder.
 * Shows a mini red subscribe button + thumbs up + text.
 */
export const CtaBanner: React.FC<CtaBannerProps> = ({ text, visible }) => {
  const frame = useCurrentFrame();
  if (!visible) return null;

  const cycleLen = FPS * 5;
  const cycleFrame = frame % cycleLen;
  const opacity = interpolate(
    cycleFrame,
    [0, FPS * 0.5, cycleLen - FPS * 0.5, cycleLen],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const pulse = interpolate(cycleFrame, [0, cycleLen / 2, cycleLen], [1, 1.03, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        left: "50%",
        transform: `translateX(-50%) scale(${pulse})`,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 16,
        backgroundColor: `${COLORS.PILL_BG}F0`,
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 14,
        padding: "12px 28px 12px 16px",
      }}
    >
      {/* Mini subscribe button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#FF0000",
          padding: "6px 14px",
          borderRadius: 6,
          boxShadow: "0 0 12px rgba(255,0,0,0.35)",
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9.5 7L16.5 12L9.5 17V7Z" fill="white" />
        </svg>
        <span style={{ color: "white", fontSize: 16, fontWeight: 800, fontFamily: "Inter, Arial, sans-serif" }}>
          SUBSCRIBE
        </span>
      </div>

      {/* Thumbs up icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M7 22H4C3.45 22 2.98 21.8 2.59 21.41C2.2 21.02 2 20.55 2 20V13C2 12.45 2.2 11.98 2.59 11.59C2.98 11.2 3.45 11 4 11H7M14 9V5C14 4.2 13.68 3.52 13.12 3.05C12.55 2.58 11.87 2.35 11.07 2.35L7 11V22H18.28C18.86 22.01 19.36 21.81 19.78 21.42C20.2 21.02 20.44 20.51 20.5 19.94L21.47 12.94C21.51 12.59 21.47 12.25 21.35 11.93C21.23 11.61 21.04 11.33 20.8 11.1C20.55 10.87 20.27 10.7 19.95 10.59C19.63 10.48 19.3 10.44 18.96 10.47H14Z"
          fill="white"
        />
      </svg>

      {/* Text */}
      <span
        style={{
          color: COLORS.TEXT_SOFT,
          fontSize: 22,
          fontFamily: "Inter, Arial, sans-serif",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </div>
  );
};
