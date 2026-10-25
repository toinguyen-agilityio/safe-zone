import type { Box } from './spatial-grid';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/**
 * A box for shots. The ground-plane bounds are the same as for walking; the height bounds are
 * optional, and a box without them reaches up and down forever (a column).
 */
export interface RayBox extends Box {
  minY?: number;
  maxY?: number;
}

export interface RayHit<T extends RayBox = RayBox> {
  box: T;
  /** Distance along the ray to the point where it enters the box; 0 if it starts inside. */
  distance: number;
  point: Vec3;
  /** The ray started inside the box. */
  startsInside: boolean;
}

/** Anything that can list the boxes in an area, such as a `SpatialGrid`. */
export interface BoxQuery<T extends RayBox> {
  queryBox: (area: Box) => T[];
}

const PARALLEL = 1e-12;

/** Where a ray enters and leaves a box, as distances along it, or null if it misses the box. */
function slab(origin: Vec3, dir: Vec3, box: RayBox): { enter: number; exit: number } | null {
  const bounds: [number, number, number, number, number, number][] = [
    [origin.x, dir.x, box.minX, box.maxX, 0, 0],
    [origin.y, dir.y, box.minY ?? -Infinity, box.maxY ?? Infinity, 0, 0],
    [origin.z, dir.z, box.minZ, box.maxZ, 0, 0],
  ];
  let enter = -Infinity;
  let exit = Infinity;
  for (const [o, d, min, max] of bounds) {
    if (Math.abs(d) < PARALLEL) {
      if (o < min || o > max) return null;
      continue;
    }
    const t1 = (min - o) / d;
    const t2 = (max - o) / d;
    enter = Math.max(enter, Math.min(t1, t2));
    exit = Math.min(exit, Math.max(t1, t2));
    if (enter > exit) return null;
  }
  return { enter, exit };
}

/**
 * Cast a ray and return the nearest box it hits within `maxDist`, or null. `direction` must be a
 * unit vector. `source` is a spatial grid (only boxes near the ray are tested) or a plain list.
 */
export function raycast<T extends RayBox>(
  source: BoxQuery<T> | readonly T[],
  origin: Vec3,
  direction: Vec3,
  maxDist: number,
): RayHit<T> | null {
  const end = {
    x: origin.x + direction.x * maxDist,
    z: origin.z + direction.z * maxDist,
  };
  const candidates =
    'queryBox' in source
      ? source.queryBox({
          minX: Math.min(origin.x, end.x),
          maxX: Math.max(origin.x, end.x),
          minZ: Math.min(origin.z, end.z),
          maxZ: Math.max(origin.z, end.z),
        })
      : source;

  let best: RayHit<T> | null = null;
  for (const box of candidates) {
    const span = slab(origin, direction, box);
    if (!span || span.exit < 0 || span.enter > maxDist) continue;
    const distance = Math.max(span.enter, 0);
    if (best && distance >= best.distance) continue;
    best = {
      box,
      distance,
      point: {
        x: origin.x + direction.x * distance,
        y: origin.y + direction.y * distance,
        z: origin.z + direction.z * distance,
      },
      startsInside: span.enter < 0,
    };
  }
  return best;
}
