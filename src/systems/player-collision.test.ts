import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { distanceToBox, type Box } from '../physics/spatial-grid';
import { generateHouses } from '../world/houses';
import { getLandmarks } from '../world/landmarks';
import { getLayout } from '../world/layout';
import { collidePlayer, createCollisionWorld, rectToBox } from './player-collision';

const radius = config.player.radius;
const half = config.world.mapSize / 2;

/** A small fake world: one house with a wall facing -x at x = 10. */
const house: Box = { minX: 10, maxX: 20, minZ: -10, maxZ: 10 };

const walk = (from: { x: number; z: number }, to: { x: number; z: number }, world = [house]) => {
  const player = { ...to };
  collidePlayer(player, from, world);
  return player;
};

describe('collidePlayer with a small fake world', () => {
  it('stops the player at a house wall', () => {
    const p = walk({ x: 5, z: 0 }, { x: 15, z: 0 });
    expect(p.x).toBeCloseTo(10 - radius);
  });

  it('slides along the wall', () => {
    const p = walk({ x: 9.6, z: 0 }, { x: 11, z: 4 });
    expect(p.x).toBeCloseTo(10 - radius);
    expect(p.z).toBeCloseTo(4);
  });

  it('leaves a free move alone', () => {
    const p = walk({ x: 0, z: 0 }, { x: 3, z: -2 });
    expect(p.x).toBeCloseTo(3);
    expect(p.z).toBeCloseTo(-2);
  });

  it('cannot go beyond the map boundary on any side', () => {
    expect(walk({ x: 0, z: 0 }, { x: half + 100, z: 0 }, []).x).toBeCloseTo(half - radius);
    expect(walk({ x: 0, z: 0 }, { x: -half - 100, z: 0 }, []).x).toBeCloseTo(-half + radius);
    expect(walk({ x: 0, z: 0 }, { x: 0, z: half + 100 }, []).z).toBeCloseTo(half - radius);
    expect(walk({ x: 0, z: 0 }, { x: 0, z: -half - 100 }, []).z).toBeCloseTo(-half + radius);
  });
});

describe('createCollisionWorld', () => {
  const layout = getLayout();
  const world = createCollisionWorld(layout);

  it('blocks the player at a real house', () => {
    // Pick a house away from the map edge with open ground for 3 units in front of its west wall.
    const boxes = generateHouses(layout, config.world.defaultSeed).houses.map(rectToBox);
    const box = boxes.find((b) => {
      if (b.minX < -half + 10) return false;
      const z = (b.minZ + b.maxZ) / 2;
      const corridor = {
        minX: b.minX - 3 - radius,
        maxX: b.minX - 1e-3,
        minZ: z - radius,
        maxZ: z + radius,
      };
      return world.queryBox(corridor).length === 0;
    })!;
    expect(box).toBeDefined();
    const z = (box.minZ + box.maxZ) / 2;
    const player = { x: (box.minX + box.maxX) / 2, z };
    collidePlayer(player, { x: box.minX - 3, z }, world);
    expect(distanceToBox(player.x, player.z, box)).toBeGreaterThanOrEqual(radius - 1e-6);
    expect(player.x).toBeCloseTo(box.minX - radius);
  });

  it('blocks the player at a landmark footprint', () => {
    const [landmark] = getLandmarks(layout);
    const box = rectToBox(landmark!.footprint);
    const from = { x: box.minX - 3, z: (box.minZ + box.maxZ) / 2 };
    const player = { x: (box.minX + box.maxX) / 2, z: from.z };
    collidePlayer(player, from, world);
    expect(distanceToBox(player.x, player.z, box)).toBeGreaterThanOrEqual(radius - 1e-6);
  });

  it('lets the player walk along a street', () => {
    const player = { x: 0, z: -60 };
    collidePlayer(player, { x: 0, z: 0 }, world);
    expect(player.x).toBeCloseTo(0);
    expect(player.z).toBeCloseTo(-60);
  });
});

describe('walking through the real city', () => {
  const layout = getLayout();
  const world = createCollisionWorld(layout);
  const boxes = [
    ...generateHouses(layout, config.world.defaultSeed).houses.map(rectToBox),
    ...getLandmarks(layout).map((l) => rectToBox(l.footprint)),
  ];

  it('never overlaps a house or landmark and never leaves the map, over 20000 random steps', () => {
    const rng = createRng(2024);
    const player = { x: config.player.spawn.x, z: config.player.spawn.z };
    let heading = 0;
    let blocked = 0;
    for (let step = 0; step < 20000; step++) {
      // Mostly keep going, sometimes turn, so the walk reaches walls, corners and the map edge.
      if (rng.float() < 0.05) heading = rng.float() * Math.PI * 2;
      const stride = 0.05 + rng.float() * 0.4;
      const previous = { x: player.x, z: player.z };
      player.x += Math.cos(heading) * stride;
      player.z += Math.sin(heading) * stride;
      const wanted = { x: player.x, z: player.z };
      collidePlayer(player, previous, world);
      if (Math.hypot(player.x - wanted.x, player.z - wanted.z) > 1e-6) blocked++;

      expect(Math.abs(player.x) + radius).toBeLessThanOrEqual(half + 1e-6);
      expect(Math.abs(player.z) + radius).toBeLessThanOrEqual(half + 1e-6);
      for (const box of boxes) {
        if (distanceToBox(player.x, player.z, box) < radius - 1e-6) {
          throw new Error(`step ${step}: player at ${player.x}, ${player.z} overlaps a box`);
        }
      }
    }
    // The walk really ran into walls, corners and the map edge many times.
    expect(blocked).toBeGreaterThan(200);
  });
});
