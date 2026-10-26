import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { clampToMap } from './bounds';

const half = config.world.mapSize / 2;
const radius = 0.5;
const edge = half - radius;

describe('clampToMap', () => {
  it('leaves a position inside the map alone', () => {
    expect(clampToMap({ x: 12, z: -30 }, radius)).toEqual({ x: 12, z: -30 });
    expect(clampToMap({ x: edge, z: -edge }, radius)).toEqual({ x: edge, z: -edge });
  });

  it('stops a circle at each of the four edges', () => {
    expect(clampToMap({ x: half + 50, z: 0 }, radius)).toEqual({ x: edge, z: 0 });
    expect(clampToMap({ x: -half - 50, z: 0 }, radius)).toEqual({ x: -edge, z: 0 });
    expect(clampToMap({ x: 0, z: half + 50 }, radius)).toEqual({ x: 0, z: edge });
    expect(clampToMap({ x: 0, z: -half - 50 }, radius)).toEqual({ x: 0, z: -edge });
  });

  it('stops a circle at each of the four corners', () => {
    expect(clampToMap({ x: 999, z: 999 }, radius)).toEqual({ x: edge, z: edge });
    expect(clampToMap({ x: -999, z: 999 }, radius)).toEqual({ x: -edge, z: edge });
    expect(clampToMap({ x: 999, z: -999 }, radius)).toEqual({ x: edge, z: -edge });
    expect(clampToMap({ x: -999, z: -999 }, radius)).toEqual({ x: -edge, z: -edge });
  });

  it('never returns a point outside the map, for any input', () => {
    for (const x of [-1e9, -half, -1, 0, 1, half, 1e9]) {
      for (const z of [-1e9, -half, -1, 0, 1, half, 1e9]) {
        const p = clampToMap({ x, z }, radius);
        expect(Math.abs(p.x) + radius).toBeLessThanOrEqual(half);
        expect(Math.abs(p.z) + radius).toBeLessThanOrEqual(half);
      }
    }
  });

  it('uses a different map size when given one', () => {
    expect(clampToMap({ x: 100, z: 100 }, 1, 20)).toEqual({ x: 9, z: 9 });
  });

  it('copes with a radius larger than the map by staying at the center', () => {
    expect(clampToMap({ x: 5, z: 5 }, 50, 20)).toEqual({ x: 0, z: 0 });
  });
});
