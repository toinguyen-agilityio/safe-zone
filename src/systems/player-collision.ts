import { config } from '../config';
import { moveWithCollisions, type BoxSource, type Point } from '../physics/collision';
import { clampToMap } from '../physics/bounds';
import { SpatialGrid, type Box } from '../physics/spatial-grid';
import { generateHouses } from '../world/houses';
import { getLandmarks } from '../world/landmarks';
import type { Layout, Rect } from '../world/types';

export function rectToBox(rect: Rect): Box {
  return {
    minX: rect.cx - rect.width / 2,
    maxX: rect.cx + rect.width / 2,
    minZ: rect.cz - rect.depth / 2,
    maxZ: rect.cz + rect.depth / 2,
  };
}

/** A grid of everything that blocks the player on foot: every house and every landmark footprint. */
export function createCollisionWorld(
  layout: Layout,
  seed: number = config.world.defaultSeed,
): SpatialGrid {
  const grid = new SpatialGrid();
  for (const house of generateHouses(layout, seed).houses) grid.insert(rectToBox(house));
  for (const landmark of getLandmarks(layout)) grid.insert(rectToBox(landmark.footprint));
  return grid;
}

/**
 * Move the player from where it stood to where it wants to be without entering a box, then keep
 * it inside the map. The player is changed in place; its height is left alone.
 */
export function collidePlayer(
  player: Point,
  previous: Point,
  world: BoxSource | readonly Box[],
  radius: number = config.player.radius,
): void {
  const target = { x: player.x, z: player.z };
  const resolved = clampToMap(moveWithCollisions(previous, target, radius, world), radius);
  player.x = resolved.x;
  player.z = resolved.z;
}
