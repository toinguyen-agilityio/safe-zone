import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { riverCenterX } from '../world/layout';
import { chooseCenter, chooseZoneCenters, inRiverMiddle } from './zone-center';

const { radii, startRadius } = config.zone;
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) =>
  Math.hypot(a.x - b.x, a.z - b.z);

describe('chooseZoneCenters', () => {
  it('gives one center per phase', () => {
    expect(chooseZoneCenters(1)).toHaveLength(5);
  });

  it('puts every new center inside the previous zone, over many seeds', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const centers = chooseZoneCenters(seed);
      let from = { x: 0, z: 0 };
      let fromRadius: number = startRadius;
      for (const [i, center] of centers.entries()) {
        expect(dist(center, from)).toBeLessThanOrEqual(fromRadius + 1e-9);
        // The whole next zone fits inside the old one.
        expect(dist(center, from)).toBeLessThanOrEqual(fromRadius - radii[i]! + 1e-9);
        from = center;
        fromRadius = radii[i]!;
      }
    }
  });

  it('never puts a center in the middle of the river, over many seeds', () => {
    for (let seed = 1; seed <= 200; seed++) {
      for (const center of chooseZoneCenters(seed)) {
        expect(inRiverMiddle(center)).toBe(false);
        expect(Math.abs(center.x - riverCenterX(center.z))).toBeGreaterThan(
          config.world.river.width / 2,
        );
      }
    }
  });

  it('keeps the centers on the map', () => {
    const half = config.world.mapSize / 2;
    for (let seed = 1; seed <= 100; seed++) {
      for (const c of chooseZoneCenters(seed)) {
        expect(Math.abs(c.x)).toBeLessThanOrEqual(half);
        expect(Math.abs(c.z)).toBeLessThanOrEqual(half);
      }
    }
  });

  it('is the same for the same seed and varies with the seed', () => {
    expect(chooseZoneCenters(7)).toEqual(chooseZoneCenters(7));
    expect(chooseZoneCenters(7)).not.toEqual(chooseZoneCenters(8));
  });

  it('spreads the first center over the map, not always the same spot', () => {
    const xs = new Set<number>();
    for (let seed = 1; seed <= 30; seed++) xs.add(Math.round(chooseZoneCenters(seed)[0]!.x / 40));
    expect(xs.size).toBeGreaterThan(3);
  });
});

describe('chooseCenter', () => {
  it('stays put when there is no room to move', () => {
    const center = { x: 0, z: 0 };
    expect(chooseCenter({ center, radius: 50 }, 50, createRng(1))).toEqual(center);
  });

  it('dodges a zone that sits on the river by picking the dry side', () => {
    // A zone centered on the river: some of the room is water, the center must not be.
    const z = 0;
    const onRiver = { x: riverCenterX(z), z };
    for (let seed = 1; seed <= 50; seed++) {
      const c = chooseCenter({ center: onRiver, radius: 100 }, 20, createRng(seed));
      expect(inRiverMiddle(c)).toBe(false);
      expect(dist(c, onRiver)).toBeLessThanOrEqual(80 + 1e-9);
    }
  });

  it('falls back to the driest point when almost everything is river', () => {
    const z = 0;
    const onRiver = { x: riverCenterX(z), z };
    // Room of 5 around the river middle: every point is in the river, so the best effort is returned.
    const c = chooseCenter({ center: onRiver, radius: 25 }, 20, createRng(3));
    expect(dist(c, onRiver)).toBeLessThanOrEqual(5 + 1e-9);
  });
});
