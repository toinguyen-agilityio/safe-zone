import { config } from '../config';
import { clamp } from '../core/math';
import type { Point } from './collision';

/** Keep a circle of the given radius fully inside the square map, which is centered on the origin. */
export function clampToMap(
  position: Point,
  radius: number,
  mapSize: number = config.world.mapSize,
): Point {
  const limit = Math.max(mapSize / 2 - radius, 0);
  return {
    x: clamp(position.x, -limit, limit),
    z: clamp(position.z, -limit, limit),
  };
}
