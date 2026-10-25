import { describe, expect, it } from 'vitest';
import { hasLineOfSight } from './los';
import type { RayBox } from './raycast';
import { SpatialGrid } from './spatial-grid';

const house = (minX: number, maxX: number, height = 10): RayBox => ({
  minX,
  maxX,
  minZ: -5,
  maxZ: 5,
  minY: 0,
  maxY: height,
});

const eyes = (x: number, z = 0, y = 1.7) => ({ x, y, z });

describe('hasLineOfSight', () => {
  it('sees across open ground', () => {
    expect(hasLineOfSight(eyes(0), eyes(50), [])).toBe(true);
  });

  it('does not see through a house between the two', () => {
    expect(hasLineOfSight(eyes(0), eyes(50), [house(20, 30)])).toBe(false);
  });

  it('sees in both directions the same way', () => {
    const houses = [house(20, 30)];
    expect(hasLineOfSight(eyes(50), eyes(0), houses)).toBe(false);
    expect(hasLineOfSight(eyes(0), eyes(15), houses)).toBe(true);
    expect(hasLineOfSight(eyes(15), eyes(0), houses)).toBe(true);
  });

  it('ignores a house that is not in between', () => {
    expect(hasLineOfSight(eyes(0), eyes(50), [house(60, 70)])).toBe(true);
    expect(hasLineOfSight(eyes(0), eyes(50), [house(-30, -20)])).toBe(true);
  });

  it('sees along a street past the side of a house', () => {
    const side: RayBox = { minX: 20, maxX: 30, minZ: 8, maxZ: 20, minY: 0, maxY: 10 };
    expect(hasLineOfSight(eyes(0), eyes(50), [side])).toBe(true);
  });

  it('sees over a low house from a high spot', () => {
    expect(hasLineOfSight(eyes(0, 0, 30), eyes(50, 0, 30), [house(20, 30, 10)])).toBe(true);
    expect(hasLineOfSight(eyes(0, 0, 30), eyes(50, 0, 30), [house(20, 30, 40)])).toBe(false);
  });

  it('is blocked by the first of several houses', () => {
    expect(hasLineOfSight(eyes(0), eyes(100), [house(60, 70), house(20, 30)])).toBe(false);
  });

  it('sees a target standing right at the wall facing it', () => {
    expect(hasLineOfSight(eyes(0), eyes(20), [house(20, 30)])).toBe(true);
  });

  it('works with a spatial grid', () => {
    const grid = new SpatialGrid<RayBox>();
    grid.insert(house(20, 30));
    expect(hasLineOfSight(eyes(0), eyes(50), grid)).toBe(false);
    expect(hasLineOfSight(eyes(0), eyes(15), grid)).toBe(true);
  });

  it('sees itself', () => {
    expect(hasLineOfSight(eyes(5), eyes(5), [house(0, 10)])).toBe(true);
  });
});
