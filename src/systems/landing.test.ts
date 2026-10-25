import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { distanceToBox, type Box } from '../physics/spatial-grid';
import { generateHouses } from '../world/houses';
import { getLandmarks } from '../world/landmarks';
import { getLayout } from '../world/layout';
import { isFreeGround, resolveLanding } from './landing';
import { createCollisionWorld, rectToBox } from './player-collision';

const radius = config.player.radius;
const half = config.world.mapSize / 2;

describe('with one house', () => {
  const house: Box = { minX: 10, maxX: 20, minZ: -10, maxZ: 10 };

  it('leaves a free landing spot alone', () => {
    expect(resolveLanding({ x: 0, z: 0 }, [house])).toEqual({ x: 0, z: 0 });
  });

  it('moves a landing point inside the house out to the nearest edge', () => {
    const spot = resolveLanding({ x: 11, z: 0 }, [house]);
    expect(spot.x).toBeCloseTo(10 - radius);
    expect(spot.z).toBeCloseTo(0);
    expect(isFreeGround(spot, radius, [house])).toBe(true);
  });

  it('moves a landing point right at the wall off the wall', () => {
    const spot = resolveLanding({ x: 10.1, z: 3 }, [house]);
    expect(distanceToBox(spot.x, spot.z, house)).toBeGreaterThanOrEqual(radius - 1e-6);
  });

  it('keeps the result inside the map', () => {
    const spot = resolveLanding({ x: half + 50, z: -half - 50 }, [house]);
    expect(Math.abs(spot.x)).toBeLessThanOrEqual(half - radius + 1e-9);
    expect(Math.abs(spot.z)).toBeLessThanOrEqual(half - radius + 1e-9);
  });
});

describe('packed blocks', () => {
  it('finds free ground when the push-out lands inside the next house', () => {
    // Two houses side by side with no gap: pushing out of one lands in the other.
    const a: Box = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };
    const b: Box = { minX: 10, maxX: 20, minZ: 0, maxZ: 10 };
    const spot = resolveLanding({ x: 10, z: 5 }, [a, b]);
    expect(isFreeGround(spot, radius, [a, b])).toBe(true);
    expect(Math.hypot(spot.x - 10, spot.z - 5)).toBeLessThan(8);
  });
});

describe('in the real city', () => {
  const layout = getLayout();
  const world = createCollisionWorld(layout);
  const boxes: Box[] = [
    ...generateHouses(layout, config.world.defaultSeed).houses.map(rectToBox),
    ...getLandmarks(layout).map((l) => rectToBox(l.footprint)),
  ];

  it('moves the middle of every house onto free ground close by', () => {
    for (const box of boxes.slice(0, 400)) {
      const middle = { x: (box.minX + box.maxX) / 2, z: (box.minZ + box.maxZ) / 2 };
      const spot = resolveLanding(middle, world);
      expect(isFreeGround(spot, radius, world)).toBe(true);
      expect(Math.hypot(spot.x - middle.x, spot.z - middle.z)).toBeLessThan(45);
    }
  });

  it('moves the middle of each landmark out of it', () => {
    for (const landmark of getLandmarks(layout)) {
      const box = rectToBox(landmark.footprint);
      const middle = { x: (box.minX + box.maxX) / 2, z: (box.minZ + box.maxZ) / 2 };
      const spot = resolveLanding(middle, world);
      expect(distanceToBox(spot.x, spot.z, box)).toBeGreaterThanOrEqual(radius - 1e-6);
      expect(isFreeGround(spot, radius, world)).toBe(true);
    }
  });

  it('gives free ground for 2000 random landing points all over the map, never moving a free one', () => {
    const rng = createRng(77);
    for (let i = 0; i < 2000; i++) {
      const span = config.world.mapSize - 2 * radius;
      const point = { x: (rng.float() - 0.5) * span, z: (rng.float() - 0.5) * span };
      const wasFree = isFreeGround(point, radius, world);
      const spot = resolveLanding(point, world);
      expect(isFreeGround(spot, radius, world)).toBe(true);
      if (wasFree) expect(spot).toEqual(point);
    }
  });
});
