import { config } from '../config';
import { clampToMap } from '../physics/bounds';
import { resolveCollisions, type BoxSource, type Point } from '../physics/collision';
import { distanceToBox, type Box } from '../physics/spatial-grid';

const EPSILON = 1e-6;
/** The search for free ground widens in rings of this step, up to this far. */
const RING_STEP = 1;
const MAX_SEARCH = 120;
const RING_SAMPLES = 24;

function nearbyBoxes(source: BoxSource | readonly Box[], p: Point, radius: number): readonly Box[] {
  return 'queryNear' in source ? source.queryNear(p.x, p.z, radius + EPSILON) : source;
}

/** True when a circle at `p` touches no box. */
export function isFreeGround(
  p: Point,
  radius: number,
  source: BoxSource | readonly Box[],
): boolean {
  return nearbyBoxes(source, p, radius).every(
    (b) => distanceToBox(p.x, p.z, b) >= radius - EPSILON,
  );
}

/**
 * Where a player touching down at `point` should stand: the same spot if it is free, otherwise the
 * nearest free ground. First the circle is pushed out of the boxes it overlaps; if that leaves it
 * inside another box (a tightly packed block), the search widens ring by ring until it finds room.
 * The result is always inside the map.
 */
export function resolveLanding(
  point: Point,
  source: BoxSource | readonly Box[],
  radius: number = config.player.radius,
): Point {
  const start = clampToMap(point, radius);
  if (isFreeGround(start, radius, source)) return start;

  const pushed = clampToMap(
    resolveCollisions(start, radius, nearbyBoxes(source, start, radius * 4 + 8)),
    radius,
  );
  if (isFreeGround(pushed, radius, source)) return pushed;

  for (let ring = RING_STEP; ring <= MAX_SEARCH; ring += RING_STEP) {
    for (let i = 0; i < RING_SAMPLES; i++) {
      const angle = (i / RING_SAMPLES) * Math.PI * 2;
      const candidate = clampToMap(
        { x: start.x + Math.cos(angle) * ring, z: start.z + Math.sin(angle) * ring },
        radius,
      );
      if (isFreeGround(candidate, radius, source)) return candidate;
    }
  }
  return start;
}
