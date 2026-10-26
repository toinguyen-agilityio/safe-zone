import { describe, expect, it } from 'vitest';
import { createRng } from '../core/rng';
import { raycast, type RayBox, type Vec3 } from './raycast';
import { SpatialGrid } from './spatial-grid';

const box = (
  minX: number,
  maxX: number,
  minZ: number,
  maxZ: number,
  extra: Partial<RayBox> = {},
): RayBox => ({
  minX,
  maxX,
  minZ,
  maxZ,
  ...extra,
});

const origin: Vec3 = { x: 0, y: 1.7, z: 0 };
const east: Vec3 = { x: 1, y: 0, z: 0 };

describe('nearest hit', () => {
  it('returns the nearest of several boxes along the ray, whatever their order', () => {
    const near = box(10, 12, -1, 1);
    const middle = box(20, 22, -1, 1);
    const far = box(30, 32, -1, 1);
    for (const list of [
      [far, middle, near],
      [near, middle, far],
      [middle, far, near],
    ]) {
      const hit = raycast(list, origin, east, 100);
      expect(hit?.box).toBe(near);
      expect(hit?.distance).toBeCloseTo(10);
      expect(hit?.point.x).toBeCloseTo(10);
    }
  });

  it('returns the point where the ray enters the box, for a ray at an angle', () => {
    const wall = box(10, 20, -50, 50);
    const direction = { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 };
    const hit = raycast([wall], origin, direction, 100);
    expect(hit?.distance).toBeCloseTo(10 / Math.SQRT1_2);
    expect(hit?.point.z).toBeCloseTo(10);
  });
});

describe('misses', () => {
  it('returns null when nothing is on the way', () => {
    expect(raycast([box(10, 12, 5, 7)], origin, east, 100)).toBeNull();
    expect(raycast([], origin, east, 100)).toBeNull();
  });

  it('returns null when the box is behind the ray', () => {
    expect(raycast([box(-12, -10, -1, 1)], origin, east, 100)).toBeNull();
  });

  it('returns null when the box is farther than the maximum distance', () => {
    const wall = box(50, 52, -1, 1);
    expect(raycast([wall], origin, east, 49)).toBeNull();
    expect(raycast([wall], origin, east, 51)?.distance).toBeCloseTo(50);
  });

  it('passes over a low box and under a high one', () => {
    const low = box(10, 12, -1, 1, { minY: 0, maxY: 1 });
    const high = box(20, 22, -1, 1, { minY: 3, maxY: 9 });
    expect(raycast([low, high], origin, east, 100)).toBeNull();
    const tall = box(30, 32, -1, 1, { minY: 0, maxY: 5 });
    expect(raycast([low, high, tall], origin, east, 100)?.box).toBe(tall);
  });

  it('hits a house when the ray slopes into it, and goes over the roof when it slopes too steeply up', () => {
    const house = box(20, 30, -5, 5, { minY: 0, maxY: 10 });
    const slope = (rise: number): Vec3 => {
      const length = Math.hypot(1, rise);
      return { x: 1 / length, y: rise / length, z: 0 };
    };
    // From the eyes at 1.7, a gentle upward slope still meets the wall; a steep one passes over.
    expect(raycast([house], origin, slope(0.3), 100)?.point.y).toBeCloseTo(1.7 + 20 * 0.3);
    expect(raycast([house], origin, slope(0.5), 100)).toBeNull();
    // From 8 up, a downward slope comes down onto the wall at x = 20, but a steeper one hits the ground first.
    const high = { ...origin, y: 8 };
    expect(raycast([house], high, slope(-0.3), 100)?.point.y).toBeCloseTo(8 - 20 * 0.3);
    expect(raycast([house], high, slope(-0.5), 100)).toBeNull();
  });
});

describe('starting inside a box', () => {
  it('hits at distance 0 and says so', () => {
    const around = box(-5, 5, -5, 5);
    const hit = raycast([around], origin, east, 100);
    expect(hit?.distance).toBe(0);
    expect(hit?.startsInside).toBe(true);
    expect(hit?.point).toEqual(origin);
  });

  it('prefers the box it is inside over one farther along', () => {
    const around = box(-5, 5, -5, 5);
    const ahead = box(10, 12, -1, 1);
    expect(raycast([ahead, around], origin, east, 100)?.box).toBe(around);
  });
});

describe('rays parallel to an axis', () => {
  it('hits and misses correctly when the ray runs along a box face', () => {
    const wall = box(10, 12, 0, 4);
    // Runs exactly along the face at z = 0: touching counts as a hit.
    expect(raycast([wall], origin, east, 100)?.distance).toBeCloseTo(10);
    expect(raycast([wall], { ...origin, z: -0.001 }, east, 100)).toBeNull();
  });
});

describe('with a spatial grid', () => {
  it('finds exactly what a search of every box finds, for hundreds of random rays', () => {
    const rng = createRng(21);
    const boxes: RayBox[] = Array.from({ length: 800 }, () => {
      const minX = rng.float() * 600 - 300;
      const minZ = rng.float() * 600 - 300;
      return box(minX, minX + 3 + rng.float() * 12, minZ, minZ + 3 + rng.float() * 12, {
        minY: 0,
        maxY: 4 + rng.float() * 20,
      });
    });
    const grid = new SpatialGrid<RayBox>(16);
    for (const b of boxes) grid.insert(b);

    for (let i = 0; i < 400; i++) {
      const start = { x: rng.float() * 600 - 300, y: 1.7, z: rng.float() * 600 - 300 };
      const angle = rng.float() * Math.PI * 2;
      const pitch = (rng.float() - 0.5) * 0.4;
      const direction = {
        x: Math.cos(angle) * Math.cos(pitch),
        y: Math.sin(pitch),
        z: Math.sin(angle) * Math.cos(pitch),
      };
      const maxDist = 20 + rng.float() * 250;
      const fast = raycast(grid, start, direction, maxDist);
      const slow = raycast(boxes, start, direction, maxDist);
      // Two overlapping boxes can tie for nearest, so compare the distance, not which box won.
      expect(fast === null).toBe(slow === null);
      if (fast && slow) {
        expect(fast.distance).toBeCloseTo(slow.distance);
        expect(raycast([fast.box], start, direction, maxDist)?.distance).toBeCloseTo(slow.distance);
      }
    }
  });
});
