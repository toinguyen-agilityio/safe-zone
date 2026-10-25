import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { distanceToBox, SpatialGrid, type Box } from './spatial-grid';

interface Named extends Box {
  id: number;
}

const randomBoxes = (count: number, seed: number): Named[] => {
  const rng = createRng(seed);
  return Array.from({ length: count }, (_, id) => {
    const minX = rng.float() * 640 - 320;
    const minZ = rng.float() * 640 - 320;
    return { id, minX, maxX: minX + 2 + rng.float() * 30, minZ, maxZ: minZ + 2 + rng.float() * 30 };
  });
};

const ids = (boxes: Named[]) => boxes.map((b) => b.id).sort((a, b) => a - b);

describe('distanceToBox', () => {
  const box: Box = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 };

  it('is 0 inside the box and measures to the nearest edge or corner outside', () => {
    expect(distanceToBox(5, 5, box)).toBe(0);
    expect(distanceToBox(13, 5, box)).toBe(3);
    expect(distanceToBox(-3, -4, box)).toBe(5);
  });
});

describe('SpatialGrid', () => {
  it('uses the cell size from the config by default', () => {
    expect(config.world.gridCellSize).toBeGreaterThan(0);
    const grid = new SpatialGrid<Named>();
    grid.insert({ id: 1, minX: 0, maxX: 1, minZ: 0, maxZ: 1 });
    expect(grid.queryNear(0, 0, 1)).toHaveLength(1);
  });

  it('returns exactly the nearby boxes among thousands, like a brute-force check', () => {
    const boxes = randomBoxes(3000, 11);
    const grid = new SpatialGrid<Named>(16);
    for (const box of boxes) grid.insert(box);

    const rng = createRng(99);
    for (let i = 0; i < 50; i++) {
      const x = rng.float() * 640 - 320;
      const z = rng.float() * 640 - 320;
      const radius = 1 + rng.float() * 40;
      const expected = boxes.filter((b) => distanceToBox(x, z, b) <= radius);
      expect(ids(grid.queryNear(x, z, radius))).toEqual(ids(expected));
    }
  });

  it('returns a box that spans several cells only once', () => {
    const grid = new SpatialGrid<Named>(10);
    grid.insert({ id: 1, minX: -25, maxX: 25, minZ: -25, maxZ: 25 });
    expect(grid.queryNear(0, 0, 100)).toHaveLength(1);
  });

  it('finds nothing far away and works with negative coordinates', () => {
    const grid = new SpatialGrid<Named>(10);
    grid.insert({ id: 1, minX: -105, maxX: -100, minZ: -55, maxZ: -50 });
    expect(grid.queryNear(0, 0, 20)).toEqual([]);
    expect(ids(grid.queryNear(-102, -52, 1))).toEqual([1]);
  });

  it('queryBox returns boxes that overlap an area, like a brute-force check', () => {
    const boxes = randomBoxes(2000, 5);
    const grid = new SpatialGrid<Named>(16);
    for (const box of boxes) grid.insert(box);
    const area: Box = { minX: -50, maxX: 80, minZ: 10, maxZ: 40 };
    const expected = boxes.filter(
      (b) =>
        b.minX <= area.maxX && b.maxX >= area.minX && b.minZ <= area.maxZ && b.maxZ >= area.minZ,
    );
    expect(ids(grid.queryBox(area))).toEqual(ids(expected));
  });
});
