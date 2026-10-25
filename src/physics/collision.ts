import type { Box } from './spatial-grid';

export interface Point {
  x: number;
  z: number;
}

/** Anything that can list the boxes near a position, such as a `SpatialGrid`. */
export interface BoxSource {
  queryNear: (x: number, z: number, radius: number) => Box[];
}

const EPSILON = 1e-6;
const ITERATIONS = 4;

/**
 * Move a circle out of one box, if it overlaps. A circle that touches a wall is pushed straight
 * back from it, so a moving circle slides along the wall; at a corner it is pushed away from the
 * corner point, so it rounds the corner without sticking. A circle whose center is inside the box
 * leaves through the nearest face.
 */
export function pushOutOfBox(position: Point, radius: number, box: Box): Point {
  const nearestX = Math.min(Math.max(position.x, box.minX), box.maxX);
  const nearestZ = Math.min(Math.max(position.z, box.minZ), box.maxZ);
  const dx = position.x - nearestX;
  const dz = position.z - nearestZ;
  const distance = Math.hypot(dx, dz);

  if (distance >= radius) return position;

  if (distance > EPSILON) {
    const push = (radius - distance) / distance;
    return { x: position.x + dx * push, z: position.z + dz * push };
  }

  // The center is inside the box: leave through the closest face.
  const exits = [
    { x: box.minX - radius, z: position.z, cost: position.x - box.minX },
    { x: box.maxX + radius, z: position.z, cost: box.maxX - position.x },
    { x: position.x, z: box.minZ - radius, cost: position.z - box.minZ },
    { x: position.x, z: box.maxZ + radius, cost: box.maxZ - position.z },
  ];
  const best = exits.reduce((a, b) => (b.cost < a.cost ? b : a));
  return { x: best.x, z: best.z };
}

/** Push a circle out of every box it overlaps. A few passes settle corners between boxes. */
export function resolveCollisions(position: Point, radius: number, boxes: readonly Box[]): Point {
  let current = position;
  for (let pass = 0; pass < ITERATIONS; pass++) {
    let moved = false;
    for (const box of boxes) {
      const next = pushOutOfBox(current, radius, box);
      if (next !== current) {
        current = next;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return current;
}

/**
 * Move a circle from one point to another without passing through boxes. The move is cut into
 * steps shorter than half the radius, so a fast move cannot jump over a thin wall.
 */
export function moveWithCollisions(
  from: Point,
  to: Point,
  radius: number,
  source: BoxSource | readonly Box[],
): Point {
  const distance = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.max(1, Math.ceil(distance / (radius * 0.5)));
  const stepX = (to.x - from.x) / steps;
  const stepZ = (to.z - from.z) / steps;

  let current = from;
  for (let i = 0; i < steps; i++) {
    const moved = { x: current.x + stepX, z: current.z + stepZ };
    const nearby =
      'queryNear' in source ? source.queryNear(moved.x, moved.z, radius + EPSILON) : source;
    current = resolveCollisions(moved, radius, nearby);
  }
  return current;
}
