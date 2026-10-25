import { describe, expect, it } from 'vitest';
import { averageFps, FpsMeter, isFpsRequested } from './fps-meter';

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
    expect(label.textContent).toBe('60 FPS');
  });
});
