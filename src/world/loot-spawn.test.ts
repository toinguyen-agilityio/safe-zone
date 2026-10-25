import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { ITEM_TYPES } from '../entities/items';
import { generateHouses } from './houses';
import { getLandmarks, reservedArea } from './landmarks';
import { getLayout, riverCenterX } from './layout';
import { generateLoot } from './loot-spawn';

const layout = getLayout();
const seed = config.world.defaultSeed;
const items = generateLoot(layout, seed);

const inside = (
  x: number,
  z: number,
  r: { cx: number; cz: number; width: number; depth: number },
) => Math.abs(x - r.cx) <= r.width / 2 && Math.abs(z - r.cz) <= r.depth / 2;

describe('generateLoot', () => {
  it('makes about 150 items', () => {
    expect(items.length).toBe(config.loot.itemCount);
  });

  it('spreads them evenly over the four types', () => {
    for (const type of ITEM_TYPES) {
      const count = items.filter((i) => i.type === type).length;
      expect(count).toBeGreaterThanOrEqual(Math.floor(items.length / 4));
      expect(count).toBeLessThanOrEqual(Math.ceil(items.length / 4));
    }
  });

  it('gives each item its own id', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });

  it('lies on a street edge, not in the middle of the road', () => {
    const { min, max } = config.loot.sidewalkOffset;
    for (const item of items) {
      const fits = layout.streets.some((s) =>
        s.orientation === 'north-south'
          ? Math.abs(Math.abs(item.x - s.cx) - (min + max) / 2) <= (max - min) / 2 + 1e-9
          : Math.abs(Math.abs(item.z - s.cz) - (min + max) / 2) <= (max - min) / 2 + 1e-9,
      );
      expect(fits).toBe(true);
    }
  });

  it('is never inside a house or a landmark', () => {
    const houses = generateHouses(layout, seed).houses;
    const reserved = getLandmarks(layout).map(reservedArea);
    for (const item of items) {
      expect(houses.some((h) => inside(item.x, item.z, h))).toBe(false);
      expect(reserved.some((r) => inside(item.x, item.z, r))).toBe(false);
    }
  });

  it('is never in the river', () => {
    for (const item of items) {
      expect(Math.abs(item.x - riverCenterX(item.z))).toBeGreaterThan(config.world.river.width / 2);
    }
  });

  it('stays on the map and apart from other items', () => {
    const half = config.world.mapSize / 2;
    for (const [i, a] of items.entries()) {
      expect(Math.abs(a.x)).toBeLessThan(half);
      expect(Math.abs(a.z)).toBeLessThan(half);
      for (const b of items.slice(i + 1)) {
        expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeGreaterThanOrEqual(config.loot.minSpacing);
      }
    }
  });

  it('gives the same items for the same seed and other items for another', () => {
    expect(generateLoot(layout, seed)).toEqual(items);
    expect(generateLoot(layout, seed + 1)).not.toEqual(items);
  });
});
