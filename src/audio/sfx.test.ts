import { describe, expect, it } from 'vitest';
import { playHit, playPickup, playShot } from './sfx';

/** Records what the sound is built from instead of making noise. */
function fakeContext() {
  const made = { oscillators: [] as { type: string }[], noises: 0, gains: 0, started: 0 };
  const param = () => ({
    setValueAtTime: () => undefined,
    exponentialRampToValueAtTime: () => undefined,
  });
  const node = () => ({ connect: () => undefined });
  const ctx = {
    currentTime: 1,
    sampleRate: 8000,
    destination: {},
    createGain: () => {
      made.gains++;
      return { ...node(), gain: param() };
    },
    createOscillator: () => {
      const osc = {
        ...node(),
        type: 'sine',
        frequency: param(),
        start: () => made.started++,
        stop: () => undefined,
      };
      made.oscillators.push(osc);
      return osc;
    },
    createBiquadFilter: () => ({ ...node(), type: 'lowpass', frequency: param() }),
    createBuffer: (_channels: number, length: number) => ({
      getChannelData: () => new Float32Array(length),
    }),
    createBufferSource: () => {
      made.noises++;
      return { ...node(), buffer: null, start: () => made.started++ };
    },
  };
  return { ctx: ctx as unknown as AudioContext, made };
}

describe('sfx', () => {
  it('builds a shot from noise and an oscillator', () => {
    const { ctx, made } = fakeContext();
    playShot(ctx);
    expect(made.noises).toBe(1);
    expect(made.oscillators).toHaveLength(1);
    expect(made.started).toBe(2);
  });

  it('builds a hit from one short oscillator tone', () => {
    const { ctx, made } = fakeContext();
    playHit(ctx);
    expect(made.oscillators).toHaveLength(1);
    expect(made.noises).toBe(0);
    expect(made.started).toBe(1);
  });

  it('builds a pickup from two notes', () => {
    const { ctx, made } = fakeContext();
    playPickup(ctx);
    expect(made.oscillators).toHaveLength(2);
    expect(made.started).toBe(2);
  });

  it('builds a new sound on every call', () => {
    const { ctx, made } = fakeContext();
    playHit(ctx);
    playHit(ctx);
    expect(made.oscillators).toHaveLength(2);
  });

  it('stays silent while there is no audio context yet', () => {
    expect(() => {
      playShot(null);
      playHit(null);
      playPickup(null);
    }).not.toThrow();
  });
});
