import React from "react";
import { Audio, Sequence, staticFile, interpolate, useCurrentFrame } from "remotion";
import type { PhaseSegment, AudioMode, MusicTheme } from "../types";
import { FPS, AUDIO_MODES, MUSIC_THEMES } from "../config";

interface AudioLayerProps {
  segments: PhaseSegment[];
  audioMode: AudioMode;
  theme: MusicTheme;
}

/**
 * AudioLayer places all sound effects and music into the Remotion timeline.
 * Each segment gets:
 * - Signal sound at start (bell for focus, chime for break, gong for long break)
 * - Music during break segments (with volume based on audio mode)
 * - Countdown beeps in last 10 seconds of breaks
 * - Music during focus segments if audio mode is "music" or "ambient"
 */
export const AudioLayer: React.FC<AudioLayerProps> = ({
  segments,
  audioMode,
  theme,
}) => {
  const vol = AUDIO_MODES[audioMode];
  const musicFile = MUSIC_THEMES[theme].file;
  const elements: React.ReactNode[] = [];

  let frameOffset = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const segFrames = seg.durationSec * FPS;
    const key = `seg-${i}`;

    if (seg.phase === "focus") {
      // Bell sound at focus start
      elements.push(
        <Sequence key={`${key}-bell`} from={frameOffset} durationInFrames={FPS * 3}>
          <Audio src={staticFile("sounds/bell.wav")} volume={0.55} />
        </Sequence>
      );

      // Music during focus (for music/ambient modes)
      if (vol.focusVol > 0) {
        elements.push(
          <Sequence key={`${key}-fmusic`} from={frameOffset} durationInFrames={segFrames}>
            <FadeAudio
              src={staticFile(musicFile)}
              volume={vol.focusVol}
              durationFrames={segFrames}
              fadeInSec={2}
              fadeOutSec={2}
              loop
            />
          </Sequence>
        );
      }
    }

    if (seg.phase === "break") {
      // Chime sound at break start
      elements.push(
        <Sequence key={`${key}-chime`} from={frameOffset} durationInFrames={FPS * 3}>
          <Audio src={staticFile("sounds/chime.wav")} volume={0.45} />
        </Sequence>
      );

      // Break music
      elements.push(
        <Sequence key={`${key}-bmusic`} from={frameOffset} durationInFrames={segFrames}>
          <FadeAudio
            src={staticFile(musicFile)}
            volume={vol.breakVol}
            durationFrames={segFrames}
            fadeInSec={2}
            fadeOutSec={2}
            loop
          />
        </Sequence>
      );

      // Countdown beeps in last 10 seconds
      for (let s = 0; s < 10; s++) {
        const beepFrame = frameOffset + segFrames - (10 - s) * FPS;
        if (beepFrame >= frameOffset && beepFrame < frameOffset + segFrames) {
          const isLast = s === 9;
          elements.push(
            <Sequence key={`${key}-beep-${s}`} from={beepFrame} durationInFrames={Math.floor(FPS * 0.15)}>
              <Audio
                src={staticFile(isLast ? "sounds/beep_final.wav" : "sounds/beep.wav")}
                volume={0.35}
              />
            </Sequence>
          );
        }
      }
    }

    if (seg.phase === "longBreak") {
      // Gong sound at long break start
      elements.push(
        <Sequence key={`${key}-gong`} from={frameOffset} durationInFrames={FPS * 4}>
          <Audio src={staticFile("sounds/gong.wav")} volume={0.6} />
        </Sequence>
      );

      // Long break music (longer fade)
      elements.push(
        <Sequence key={`${key}-lbmusic`} from={frameOffset} durationInFrames={segFrames}>
          <FadeAudio
            src={staticFile(musicFile)}
            volume={vol.breakVol}
            durationFrames={segFrames}
            fadeInSec={3}
            fadeOutSec={3}
            loop
          />
        </Sequence>
      );

      // Countdown beeps
      for (let s = 0; s < 10; s++) {
        const beepFrame = frameOffset + segFrames - (10 - s) * FPS;
        if (beepFrame >= frameOffset && beepFrame < frameOffset + segFrames) {
          const isLast = s === 9;
          elements.push(
            <Sequence key={`${key}-lbeep-${s}`} from={beepFrame} durationInFrames={Math.floor(FPS * 0.15)}>
              <Audio
                src={staticFile(isLast ? "sounds/beep_final.wav" : "sounds/beep.wav")}
                volume={0.35}
              />
            </Sequence>
          );
        }
      }
    }

    frameOffset += segFrames;
  }

  return <>{elements}</>;
};

// ── FadeAudio: Audio with fade-in/fade-out and loop ──
interface FadeAudioProps {
  src: string;
  volume: number;
  durationFrames: number;
  fadeInSec: number;
  fadeOutSec: number;
  loop?: boolean;
}

const FadeAudio: React.FC<FadeAudioProps> = ({
  src,
  volume,
  durationFrames,
  fadeInSec,
  fadeOutSec,
  loop,
}) => {
  const frame = useCurrentFrame();
  const fadeInFrames = fadeInSec * FPS;
  const fadeOutFrames = fadeOutSec * FPS;

  const vol = interpolate(
    frame,
    [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames],
    [0, volume, volume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return <Audio src={src} volume={vol} loop={loop} />;
};
