import React from "react";
import { COLORS } from "../config";

interface SessionDotsProps {
  total: number;
  current: number;    // current active session index
  completed: number;  // number completed
}

export const SessionDots: React.FC<SessionDotsProps> = ({ total, current, completed }) => {
  if (total > 20) return null; // too many to display

  const dotSize = 16;
  const gap = 36;
  const totalWidth = (total - 1) * gap;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: `${gap - dotSize}px`,
      }}
    >
      {Array.from({ length: total }).map((_, i) => {
        let color: string;
        let border: string | undefined;
        if (i < completed) {
          color = COLORS.GREEN_SUCCESS;
        } else if (i === current) {
          color = COLORS.ACCENT_ORANGE;
        } else {
          color = COLORS.PROGRESS_BG;
          border = `2px solid ${COLORS.TEXT_DIM}`;
        }
        return (
          <div
            key={i}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: color,
              border,
              boxShadow: i < completed ? `0 0 6px ${COLORS.GREEN_SUCCESS}60` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};
