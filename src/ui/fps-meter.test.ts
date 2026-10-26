import { describe, expect, it } from 'vitest';
import { averageFps, FpsMeter, FrameStats, isFpsRequested } from './fps-meter';

describe('averageFps', () => {
  it('divides frames by seconds', () => {
    expect(averageFps(60, 1)).toBe(60);
    expect(averageFps(90, 1.5)).toBe(60);
  });

  it('returns 0 when no time passed', () => {
    expect(averageFps(10, 0)).toBe(0);
  });
});

describe('isFpsRequested', () => {
  it('is true only when ?fps is in the URL', () => {
    expect(isFpsRequested('?fps')).toBe(true);
    expect(isFpsRequested('?a=1&fps=1')).toBe(true);
    expect(isFpsRequested('')).toBe(false);
    expect(isFpsRequested('?debug')).toBe(false);
  });
});

describe('FpsMeter', () => {
  it('updates the label about once a second', () => {
    const label = { textContent: '' as string | null };
    const meter = new FpsMeter(label);
    for (let i = 0; i < 59; i++) meter.update(1 / 60);
    expect(label.textContent).toBe('');
    meter.update(1 / 60 + 0.001);
    expect(label.textContent).toBe('60 FPS · 1% low 57');
  });

  it('keeps the whole run to work out the 1 percent low', () => {
    const meter = new FpsMeter({ textContent: '' });
    for (let i = 0; i < 99; i++) meter.update(1 / 100);
    meter.update(0.1);
    expect(meter.stats.frames).toBe(100);
    expect(meter.stats.onePercentLowFps).toBeCloseTo(10);
  });
});

describe('FrameStats', () => {
  const steady = (stats: FrameStats, frames: number, seconds: number) => {
    for (let i = 0; i < frames; i++) stats.record(seconds);
  };

  it('has nothing to report before any frame', () => {
    const stats = new FrameStats();
    expect(stats.averageFps).toBe(0);
    expect(stats.onePercentLowFps).toBe(0);
  });

  it('gives the same average and low for a steady 60 FPS', () => {
    const stats = new FrameStats();
    steady(stats, 600, 1 / 60);
    expect(stats.averageFps).toBeCloseTo(60);
    expect(stats.onePercentLowFps).toBeCloseTo(60);
  });

  it('shows stutter in the low but hardly in the average', () => {
    const stats = new FrameStats();
    // 990 smooth frames and 10 that each took a tenth of a second.
    steady(stats, 990, 1 / 100);
    steady(stats, 10, 0.1);
    expect(stats.averageFps).toBeGreaterThan(60);
    expect(stats.onePercentLowFps).toBeCloseTo(10);
  });

  it('counts the slowest 1 percent as at least one frame', () => {
    const stats = new FrameStats();
    steady(stats, 20, 1 / 60);
    stats.record(0.2);
    expect(stats.onePercentLowFps).toBeCloseTo(5);
  });

  it('ignores frames with no time and zero or negative times', () => {
    const stats = new FrameStats();
    stats.record(0);
    stats.record(-1);
    stats.record(1 / 30);
    expect(stats.frames).toBe(1);
    expect(stats.averageFps).toBeCloseTo(30);
  });

  it('keeps only the latest frames when there are too many', () => {
    const stats = new FrameStats(10);
    steady(stats, 10, 0.1);
    steady(stats, 10, 0.01);
    expect(stats.frames).toBe(10);
    expect(stats.averageFps).toBeCloseTo(100);
  });

  it('can start again', () => {
    const stats = new FrameStats();
    steady(stats, 5, 0.5);
    stats.reset();
    expect(stats.frames).toBe(0);
    expect(stats.averageFps).toBe(0);
  });
});
