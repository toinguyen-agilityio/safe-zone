import { config } from '../config';
import type { Rng } from '../core/rng';
import { clampToMap } from '../physics/bounds';
import type { BoxSource } from '../physics/collision';
import type { Box } from '../physics/spatial-grid';
import { isFreeGround } from '../systems/landing';
import type { ZoneCircle } from '../systems/zone-system';
import { inRiverMiddle } from '../systems/zone-center';

const TRIES = 200;
/** A destination stays this far inside the circle edge, so the bot arrives safely dry. */
const EDGE_MARGIN = 0.9;

export interface Destination {
  x: number;
  z: number;
}

/** Walkable means on the map, out of the river and clear of every house and landmark. */
function walkable(
  p: Destination,
  world: BoxSource | readonly Box[],
  radius: number = config.player.radius,
): boolean {
  const clamped = clampToMap(p, radius);
  return (
    clamped.x === p.x && clamped.z === p.z && !inRiverMiddle(p) && isFreeGround(p, radius, world)
  );
}

/**
 * A seeded point for a bot to walk to, inside the next dry zone: on the map, outside houses and
 * landmarks and out of the river. Points are spread evenly over the circle. When the circle holds
 * hardly any walkable ground, the closest walkable point to its center is used instead.
 */
export function pickDestination(
  zone: ZoneCircle,
  world: BoxSource | readonly Box[],
  rng: Rng,
): Destination {
  const reach = zone.radius * EDGE_MARGIN;
  for (let i = 0; i < TRIES; i++) {
    const angle = rng.float() * Math.PI * 2;
    const distance = Math.sqrt(rng.float()) * reach;
    const p = {
      x: zone.center.x + Math.cos(angle) * distance,
      z: zone.center.z + Math.sin(angle) * distance,
    };
    if (walkable(p, world)) return p;
  }
  return closestWalkable(zone, reach, world);
}

/** Search outward from the center in rings for the nearest walkable point inside the circle. */
function closestWalkable(
  zone: ZoneCircle,
  reach: number,
  world: BoxSource | readonly Box[],
): Destination {
  const samples = 32;
  for (let ring = 0; ring <= reach; ring += 1) {
    for (let j = 0; j < samples; j++) {
      const angle = (j / samples) * Math.PI * 2;
      const p = {
        x: zone.center.x + Math.cos(angle) * ring,
        z: zone.center.z + Math.sin(angle) * ring,
      };
      if (walkable(p, world)) return p;
    }
  }
  return { x: zone.center.x, z: zone.center.z };
}
