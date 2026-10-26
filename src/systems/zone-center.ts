import { config } from '../config';
import { createRng, type Rng } from '../core/rng';
import { riverCenterX } from '../world/layout';
import type { ZonePoint } from './zone';

const { radii, startRadius } = config.zone;
const { river } = config.world;
const TRIES = 200;
const MAP_CENTER: ZonePoint = { x: 0, z: 0 };

/** True when the point lies on the water: within half the river width of its middle line. */
export function inRiverMiddle(p: ZonePoint): boolean {
  return Math.abs(p.x - riverCenterX(p.z)) <= river.width / 2;
}

/**
 * A center for the next zone with radius `nextRadius`, inside the zone `from` and not in the
 * river. It is picked so that the whole next zone fits inside the old one, which also puts the
 * center inside the old zone, and it is spread evenly over the room there is.
 */
export function chooseCenter(
  from: { center: ZonePoint; radius: number },
  nextRadius: number,
  rng: Rng,
): ZonePoint {
  const room = Math.max(0, from.radius - nextRadius);
  for (let i = 0; i < TRIES; i++) {
    const angle = rng.float() * Math.PI * 2;
    const distance = Math.sqrt(rng.float()) * room;
    const p = {
      x: from.center.x + Math.cos(angle) * distance,
      z: from.center.z + Math.sin(angle) * distance,
    };
    if (!inRiverMiddle(p)) return p;
  }
  return fallbackCenter(from.center, room);
}

/** When luck runs out: the dry point inside the room that is farthest from the river middle. */
function fallbackCenter(center: ZonePoint, room: number): ZonePoint {
  let best = center;
  let bestGap = -Infinity;
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j < steps; j++) {
      const distance = (i / steps) * room;
      const angle = (j / steps) * Math.PI * 2;
      const p = {
        x: center.x + Math.cos(angle) * distance,
        z: center.z + Math.sin(angle) * distance,
      };
      const gap = Math.abs(p.x - riverCenterX(p.z)) - river.width / 2;
      if (gap > bestGap) {
        best = p;
        bestGap = gap;
      }
    }
  }
  return best;
}

/**
 * The centers of all five phases, one after the other: each inside the previous zone and out of
 * the river middle. The same seed always gives the same centers.
 */
export function chooseZoneCenters(seed: number = config.world.defaultSeed): ZonePoint[] {
  const rng = createRng(seed ^ 0x20e);
  const centers: ZonePoint[] = [];
  let from: { center: ZonePoint; radius: number } = { center: MAP_CENTER, radius: startRadius };
  for (const radius of radii) {
    const center = chooseCenter(from, radius, rng);
    centers.push(center);
    from = { center, radius };
  }
  return centers;
}
