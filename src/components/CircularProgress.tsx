import React from "react";
import { COLORS } from "../config";

interface CircularProgressProps {
  progress: number;
  accentColor: string;
  glowFilter: string;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  accentColor,
  glowFilter,
  size = 440,
  strokeWidth = 16,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  // Progress head position for the glowing dot
  const angle = Math.PI * 2 * progress - Math.PI / 2;
  const headX = center + radius * Math.cos(angle);
  const headY = center + radius * Math.sin(angle);

  return (
    <svg width={size} height={size} style={{ filter: glowFilter }}>
      {/* Outer subtle ring */}
      <circle
        cx={center}
        cy={center}
        r={radius + strokeWidth + 4}
        fill="none"
        stroke={`${accentColor}08`}
        strokeWidth={1}
      />
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={COLORS.RING_BG}
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
      />
      {/* Start cap (top center) */}
      <circle
        cx={center}
        cy={center - radius}
        r={strokeWidth / 2 + 2}
        fill={accentColor}
      />
      {/* Moving head glow dot */}
      {progress > 0.005 && (
        <>
          <circle cx={headX} cy={headY} r={strokeWidth / 2 + 6} fill={`${accentColor}30`} />
          <circle cx={headX} cy={headY} r={strokeWidth / 2 + 2} fill={accentColor} />
        </>
      )}
    </svg>
  );
};
