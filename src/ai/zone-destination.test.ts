import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { isFreeGround } from '../systems/landing';
import { createCollisionWorld } from '../systems/player-collision';
import { inRiverMiddle } from '../systems/zone-center';
import { getLayout, riverCenterX } from '../world/layout';
import { pickDestination } from './zone-destination';

const world = createCollisionWorld(getLayout());
const dist = (a: { x: number; z: number }, b: { x: number; z: number }) =>
  Math.hypot(a.x - b.x, a.z - b.z);

const zones = [
  { center: { x: -100, z: 50 }, radius: 130 },
  { center: { x: 20, z: -60 }, radius: 68 },
  { center: { x: -40, z: 100 }, radius: 30 },
  // A zone that covers part of the river.
  { center: { x: riverCenterX(0) - 30, z: 0 }, radius: 100 },
];

describe('pickDestination', () => {
  it('lies inside the zone circle', () => {
    for (const zone of zones) {
      for (let seed = 1; seed <= 40; seed++) {
        const p = pickDestination(zone, world, createRng(seed));
        expect(dist(p, zone.center)).toBeLessThanOrEqual(zone.radius);
      }
    }
  });

  it('is outside every house and landmark', () => {
    for (const zone of zones) {
      for (let seed = 1; seed <= 40; seed++) {
        const p = pickDestination(zone, world, createRng(seed));
        expect(isFreeGround(p, config.player.radius, world)).toBe(true);
      }
    }
  });

  it('is never in the river', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = pickDestination(zones[3]!, world, createRng(seed));
      expect(inRiverMiddle(p)).toBe(false);
    }
  });

  it('stays on the map', () => {
    const half = config.world.mapSize / 2;
    const edge = { center: { x: half - 10, z: half - 10 }, radius: 60 };
    for (let seed = 1; seed <= 40; seed++) {
      const p = pickDestination(edge, world, createRng(seed));
      expect(Math.abs(p.x)).toBeLessThanOrEqual(half);
      expect(Math.abs(p.z)).toBeLessThanOrEqual(half);
    }
  });

  it('is the same for the same seed and spreads over the zone for different seeds', () => {
    const zone = zones[0]!;
    expect(pickDestination(zone, world, createRng(4))).toEqual(
      pickDestination(zone, world, createRng(4)),
    );
    const spots = new Set<string>();
    for (let seed = 1; seed <= 30; seed++) {
      const p = pickDestination(zone, world, createRng(seed));
      spots.add(`${Math.round(p.x / 20)},${Math.round(p.z / 20)}`);
    }
    expect(spots.size).toBeGreaterThan(5);
  });

  it('falls back to walkable ground near the center in a tiny zone', () => {
    const tiny = { center: { x: 0, z: 0 }, radius: 0.5 };
    const p = pickDestination(tiny, world, createRng(1));
    expect(Number.isFinite(p.x) && Number.isFinite(p.z)).toBe(true);
    expect(dist(p, tiny.center)).toBeLessThanOrEqual(tiny.radius + 1e-9);
  });
});
