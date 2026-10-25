import { raycast, type BoxQuery, type RayBox, type Vec3 } from './raycast';

/** Gaps shorter than this count as no gap, so two positions in the same spot see each other. */
const MIN_DISTANCE = 1e-6;
/** A wall touching the far end does not block it: the target is at the wall, not behind it. */
const END_TOLERANCE = 1e-4;

/**
 * True when no house or landmark blocks the straight line from `from` to `to`. A bot at street
 * level sees along the street but not through a house, and sees over a low house when it is high.
 */
export function hasLineOfSight(
  from: Vec3,
  to: Vec3,
  obstacles: BoxQuery<RayBox> | readonly RayBox[],
): boolean {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const distance = Math.hypot(dx, dy, dz);
  if (distance < MIN_DISTANCE) return true;

  const direction = { x: dx / distance, y: dy / distance, z: dz / distance };
  const hit = raycast(obstacles, from, direction, distance);
  return hit === null || hit.distance >= distance - END_TOLERANCE;
}
