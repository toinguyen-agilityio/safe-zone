import { describe, expect, it, vi } from 'vitest';
import { config } from '../config';

const calls: { ratio?: number } = {};

vi.mock('three', async (importOriginal) => {
  const three = await importOriginal<typeof import('three')>();
  class FakeRenderer {
    domElement = {};
    setPixelRatio(ratio: number) {
      calls.ratio = ratio;
    }
  }
  return { ...three, WebGLRenderer: FakeRenderer };
});

const { createRenderer, pixelRatioFor } = await import('./renderer');

describe('pixelRatioFor', () => {
  it('uses 1.5 on a display with a device pixel ratio of 2', () => {
    expect(pixelRatioFor(2)).toBe(1.5);
    expect(config.world.maxPixelRatio).toBe(1.5);
  });

  it('caps every higher ratio too', () => {
    expect(pixelRatioFor(3)).toBe(1.5);
    expect(pixelRatioFor(2.625)).toBe(1.5);
  });

  it('keeps a lower ratio as it is', () => {
    expect(pixelRatioFor(1)).toBe(1);
    expect(pixelRatioFor(1.25)).toBe(1.25);
    expect(pixelRatioFor(1.5)).toBe(1.5);
  });

  it('falls back to 1 when the ratio is missing or not sensible', () => {
    expect(pixelRatioFor(0)).toBe(1);
    expect(pixelRatioFor(-2)).toBe(1);
    expect(pixelRatioFor(Number.NaN)).toBe(1);
    expect(pixelRatioFor(Number.POSITIVE_INFINITY)).toBe(1);
  });
});

describe('createRenderer', () => {
  const container = { appendChild: () => undefined } as unknown as HTMLElement;

  it('sets the capped pixel ratio from a window of a sharp display', () => {
    createRenderer(container, { devicePixelRatio: 2 });
    expect(calls.ratio).toBe(1.5);
  });

  it('sets the display ratio on an ordinary screen', () => {
    createRenderer(container, { devicePixelRatio: 1 });
    expect(calls.ratio).toBe(1);
  });
});
