import { config } from '../config';
import { createRng } from '../core/rng';
import { ITEM_TYPES, type ItemType } from '../entities/items';
import { SpatialGrid, type Box } from '../physics/spatial-grid';
import { generateHouses } from './houses';
import { getLandmarks, reservedArea } from './landmarks';
import { riverCenterX } from './layout';
import type { Layout, Rect } from './types';

const { loot, world } = config;

export interface LootItem {
  id: number;
  type: ItemType;
  x: number;
  z: number;
}

const toBox = (rect: Rect): Box => ({
  minX: rect.cx - rect.width / 2,
  maxX: rect.cx + rect.width / 2,
  minZ: rect.cz - rect.depth / 2,
  maxZ: rect.cz + rect.depth / 2,
});

/** Every house and landmark, to keep items out of them. */
function solidGrid(layout: Layout, seed: number): SpatialGrid<Box> {
  const grid = new SpatialGrid<Box>();
  for (const house of generateHouses(layout, seed).houses) grid.insert(toBox(house));
  for (const landmark of getLandmarks(layout)) grid.insert(toBox(reservedArea(landmark)));
  return grid;
}

function inRiver(x: number, z: number): boolean {
  return Math.abs(x - riverCenterX(z)) <= world.river.width / 2 + loot.clearance;
}

function onBridge(layout: Layout, x: number, z: number): boolean {
  return layout.bridges.some(
    (b) =>
      Math.abs(z - b.z) <= b.deckWidth / 2 + loot.clearance &&
      x >= b.xStart - loot.clearance &&
      x <= b.xEnd + loot.clearance,
  );
}

/**
 * About `loot.itemCount` items along the sides of the streets, spread evenly over the four types.
 * None lies inside a house, a landmark, the river or on a bridge, and none is close to another.
 * The same seed gives the same items.
 */
export function generateLoot(layout: Layout, seed: number = world.defaultSeed): LootItem[] {
  const rng = createRng(seed ^ 0x100707);
  const solids = solidGrid(layout, seed);
  const items: LootItem[] = [];
  const limit = world.mapSize / 2 - loot.clearance;
  const maxAttempts = loot.itemCount * 200;

  for (let attempt = 0; attempt < maxAttempts && items.length < loot.itemCount; attempt++) {
    const street = rng.pick(layout.streets);
    const along = rng.float();
    const side = rng.float() < 0.5 ? -1 : 1;
    const offset =
      loot.sidewalkOffset.min + rng.float() * (loot.sidewalkOffset.max - loot.sidewalkOffset.min);
    const eastWest = street.orientation === 'east-west';
    const x = eastWest
      ? street.cx - street.width / 2 + along * street.width
      : street.cx + side * offset;
    const z = eastWest
      ? street.cz + side * offset
      : street.cz - street.depth / 2 + along * street.depth;

    if (Math.abs(x) > limit || Math.abs(z) > limit) continue;
    if (inRiver(x, z) || onBridge(layout, x, z)) continue;
    const near = {
      minX: x - loot.clearance,
      maxX: x + loot.clearance,
      minZ: z - loot.clearance,
      maxZ: z + loot.clearance,
    };
    if (solids.queryBox(near).length > 0) continue;
    if (items.some((i) => Math.hypot(i.x - x, i.z - z) < loot.minSpacing)) continue;

    const id = items.length;
    items.push({ id, type: ITEM_TYPES[id % ITEM_TYPES.length]!, x, z });
  }
  return items;
}
