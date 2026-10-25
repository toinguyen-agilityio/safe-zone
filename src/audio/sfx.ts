import { getAudio } from './audio-context';

/** Every sound is built from oscillators and noise when it is played; there are no audio files. */

/** A short burst of white noise, as a buffer source. */
function noiseBurst(ctx: AudioContext, seconds: number): AudioBufferSourceNode {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

/** A gain that starts at `peak` and dies away to nothing over `seconds`. */
function decay(ctx: AudioContext, start: number, seconds: number, peak: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(peak, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
  gain.connect(ctx.destination);
  return gain;
}

/** A tone that slides from `from` to `to` Hz while it fades. */
function tone(
  ctx: AudioContext,
  type: OscillatorType,
  from: number,
  to: number,
  start: number,
  seconds: number,
  peak: number,
): void {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  osc.frequency.exponentialRampToValueAtTime(to, start + seconds);
  osc.connect(decay(ctx, start, seconds, peak));
  osc.start(start);
  osc.stop(start + seconds);
}

/** A rifle shot: a crack of filtered noise on top of a low thump. */
export function playShot(ctx: AudioContext | null = getAudio()): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  const crack = noiseBurst(ctx, 0.12);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, now);
  filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);
  crack.connect(filter);
  filter.connect(decay(ctx, now, 0.12, 0.5));
  crack.start(now);
  tone(ctx, 'sine', 160, 45, now, 0.12, 0.6);
}

/** A bullet landing: a short sharp tick. */
export function playHit(ctx: AudioContext | null = getAudio()): void {
  if (!ctx) return;
  tone(ctx, 'square', 1200, 500, ctx.currentTime, 0.06, 0.15);
}

/** Picking something up: two quick rising notes. */
export function playPickup(ctx: AudioContext | null = getAudio()): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, 'sine', 660, 660, now, 0.08, 0.25);
  tone(ctx, 'sine', 990, 990, now + 0.08, 0.12, 0.25);
}
