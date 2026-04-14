/**
 * Generate signal sound WAV files for the Pomodoro timer.
 * Run once: npx tsx scripts/generate-tones.ts
 * Creates: public/sounds/bell.wav, chime.wav, gong.wav, beep.wav, beep_final.wav
 */
import * as fs from "fs";
import * as path from "path";

const SAMPLE_RATE = 44100;

function generateTone(
  freqList: Array<{ freq: number; amp: number }>,
  durationSec: number,
  decayRate: number,
  volume: number
): Buffer {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const samples = new Float64Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let val = 0;
    for (const { freq, amp } of freqList) {
      val += Math.sin(2 * Math.PI * freq * t) * amp;
    }
    // Exponential decay envelope
    const env = Math.exp(-t * decayRate);
    // Attack ramp (5ms)
    const attackSamples = Math.min(Math.floor(SAMPLE_RATE * 0.005), numSamples);
    const attackMul = i < attackSamples ? i / attackSamples : 1;
    samples[i] = val * env * attackMul * volume;
  }

  return samplesToWav(samples);
}

function generateBeep(freq: number, durationSec: number, volume: number): Buffer {
  const numSamples = Math.floor(SAMPLE_RATE * durationSec);
  const samples = new Float64Array(numSamples);
  const fadeSamples = Math.min(Math.floor(SAMPLE_RATE * 0.01), Math.floor(numSamples / 2));

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1;
    if (i < fadeSamples) env = i / fadeSamples;
    if (i > numSamples - fadeSamples) env = (numSamples - i) / fadeSamples;
    samples[i] = Math.sin(2 * Math.PI * freq * t) * volume * env;
  }

  return samplesToWav(samples);
}

function samplesToWav(samples: Float64Array): Buffer {
  const numSamples = samples.length;
  const numChannels = 2; // stereo
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buffer.write("RIFF", offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write("WAVE", offset); offset += 4;

  // fmt chunk
  buffer.write("fmt ", offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;        // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2;         // PCM
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(SAMPLE_RATE, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data chunk
  buffer.write("data", offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let i = 0; i < numSamples; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.floor(val * 32767);
    // Write stereo (same value both channels)
    buffer.writeInt16LE(int16, offset); offset += 2;
    buffer.writeInt16LE(int16, offset); offset += 2;
  }

  return buffer;
}

// ── Main ──
const outDir = path.join(__dirname, "..", "public", "sounds");
fs.mkdirSync(outDir, { recursive: true });

// Focus bell: Singing bowl — 528Hz + harmonics, 2.5s decay
const bell = generateTone(
  [
    { freq: 528, amp: 0.5 },
    { freq: 1056, amp: 0.25 },
    { freq: 1584, amp: 0.12 },
    { freq: 792, amp: 0.15 },
  ],
  2.5, 1.8, 0.55
);
fs.writeFileSync(path.join(outDir, "bell.wav"), bell);

// Break chime: Warm — 396Hz, 2.0s decay
const chime = generateTone(
  [
    { freq: 396, amp: 0.4 },
    { freq: 528, amp: 0.3 },
    { freq: 660, amp: 0.15 },
    { freq: 330, amp: 0.2 },
  ],
  2.0, 2.2, 0.45
);
fs.writeFileSync(path.join(outDir, "chime.wav"), chime);

// Long break gong: Deep — 174Hz, 3.5s decay
const gong = generateTone(
  [
    { freq: 174, amp: 0.5 },
    { freq: 348, amp: 0.3 },
    { freq: 261, amp: 0.25 },
    { freq: 522, amp: 0.1 },
  ],
  3.5, 1.2, 0.6
);
fs.writeFileSync(path.join(outDir, "gong.wav"), gong);

// Countdown beep: 880Hz, 0.12s
const beep = generateBeep(880, 0.12, 0.35);
fs.writeFileSync(path.join(outDir, "beep.wav"), beep);

// Final countdown beep: 1046Hz, 0.12s
const beepFinal = generateBeep(1046, 0.12, 0.35);
fs.writeFileSync(path.join(outDir, "beep_final.wav"), beepFinal);

console.log("✅ Sound files generated in public/sounds/");
console.log("   bell.wav, chime.wav, gong.wav, beep.wav, beep_final.wav");
