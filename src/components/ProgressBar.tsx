import React from "react";
import { COLORS } from "../config";

interface ProgressBarProps {
  progress: number;
  accentColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  accentColor = COLORS.ACCENT_ORANGE,
}) => {
  const pct = Math.min(100, Math.max(0, progress * 100));
  return (
    <div
      style={{
        position: "absolute",
        bottom: 50,
        left: 340,
        right: 340,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.PROGRESS_BG,
        overflow: "hidden",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 5,
          backgroundColor: accentColor,
          boxShadow: `0 0 14px ${accentColor}60, 0 0 4px ${accentColor}40`,
        }}
      />
    </div>
  );
};
