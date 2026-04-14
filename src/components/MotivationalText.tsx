import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS } from "../config";

interface MotivationalTextProps {
  text: string;
  frameInSegment: number;
  color: string;
  fontSize?: number;
  durationSec?: number;
}

export const MotivationalText: React.FC<MotivationalTextProps> = ({
  text,
  frameInSegment,
  color,
  fontSize = 52,
  durationSec = 3,
}) => {
  const totalFrames = durationSec * FPS;
  if (frameInSegment >= totalFrames) return null;

  const { fps } = useVideoConfig();

  // Spring entrance
  const enterProgress = spring({
    frame: frameInSegment,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  // Fade out in last second
  const opacity = interpolate(
    frameInSegment,
    [0, FPS * 0.2, totalFrames - FPS * 0.6, totalFrames],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  const scale = interpolate(enterProgress, [0, 1], [0.85, 1]);
  const translateY = interpolate(enterProgress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        color,
        fontSize,
        fontFamily: "Inter, Arial, sans-serif",
        fontWeight: 800,
        textAlign: "center",
        letterSpacing: 3,
        textShadow: `0 0 30px ${color}50, 0 2px 4px rgba(0,0,0,0.4)`,
      }}
    >
      {text}
    </div>
  );
};
