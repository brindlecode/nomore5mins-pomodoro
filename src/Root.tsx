import React from "react";
import { Composition, Still } from "remotion";
import type { VideoProps } from "./types";
import { FPS, WIDTH, HEIGHT, THUMB_W, THUMB_H } from "./config";
import { PomodoroVideo } from "./PomodoroVideo";
import { Thumbnail } from "./Thumbnail";
import { buildTimeline } from "./utils";

/**
 * Calculate total frames for a given video config.
 * This is used by Remotion to know the composition duration.
 */
const calculateDuration = (props: VideoProps): number => {
  const timeline = buildTimeline(props);
  return timeline.totalDurationSec * FPS;
};

// Default props for studio preview
const defaultProps: VideoProps = {
  config: "25-5",
  mode: "sprint",
  sprint: 2,
  audioMode: "silent",
  theme: "default",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Video Composition */}
      <Composition
        id="PomodoroVideo"
        component={PomodoroVideo}
        durationInFrames={calculateDuration(defaultProps)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={defaultProps}
        calculateMetadata={async ({ props }) => {
          return {
            durationInFrames: calculateDuration(props),
            fps: FPS,
            width: WIDTH,
            height: HEIGHT,
          };
        }}
      />

      {/* Thumbnail Still */}
      <Still
        id="Thumbnail"
        component={Thumbnail}
        width={THUMB_W}
        height={THUMB_H}
        defaultProps={defaultProps}
      />

      {/* Quick Preview — Short 1x sprint for fast testing */}
      <Composition
        id="Preview"
        component={PomodoroVideo}
        durationInFrames={calculateDuration({
          config: "15-3",
          mode: "sprint",
          sprint: 1,
          audioMode: "silent",
          theme: "default",
        })}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          config: "15-3",
          mode: "sprint",
          sprint: 1,
          audioMode: "silent",
          theme: "default",
        } as VideoProps}
      />
    </>
  );
};
