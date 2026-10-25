import { describe, expect, it } from 'vitest';
import { distanceToBox, SpatialGrid, type Box } from './spatial-grid';
import { moveWithCollisions, pushOutOfBox, resolveCollisions } from './collision';

const RADIUS = 0.5;
const wall: Box = { minX: 10, maxX: 20, minZ: -10, maxZ: 10 };

const clearOf = (p: { x: number; z: number }, box: Box) =>
  distanceToBox(p.x, p.z, box) >= RADIUS - 1e-6;

describe('wall block', () => {
  it('stops a circle that walks into a wall at its radius from the wall', () => {
    const end = moveWithCollisions({ x: 5, z: 0 }, { x: 15, z: 0 }, RADIUS, [wall]);
    expect(end.x).toBeCloseTo(10 - RADIUS);
    expect(end.z).toBeCloseTo(0);
  });

  it('does not tunnel through the wall even in one very long step', () => {
    const end = moveWithCollisions({ x: -20, z: 0 }, { x: 40, z: 0 }, RADIUS, [wall]);
    expect(end.x).toBeCloseTo(10 - RADIUS);
  });

  it('does not tunnel through a thin wall', () => {
    const thin: Box = { minX: 10, maxX: 10.1, minZ: -10, maxZ: 10 };
    const end = moveWithCollisions({ x: 0, z: 0 }, { x: 30, z: 0 }, RADIUS, [thin]);
    expect(end.x).toBeLessThan(10);
  });

  it('leaves a circle that is clear of every box where it is', () => {
    const p = { x: 0, z: 0 };
    expect(pushOutOfBox(p, RADIUS, wall)).toBe(p);
    expect(resolveCollisions(p, RADIUS, [wall])).toBe(p);
  });
});

describe('sliding', () => {
  it('slides along the wall when walking into it at an angle', () => {
    const end = moveWithCollisions({ x: 9, z: 0 }, { x: 12, z: 3 }, RADIUS, [wall]);
    expect(end.x).toBeCloseTo(10 - RADIUS);
    expect(end.z).toBeCloseTo(3);
  });

  it('keeps its full speed along the wall over many small steps', () => {
    let p = { x: 9.5, z: -5 };
    for (let i = 0; i < 50; i++)
      p = moveWithCollisions(p, { x: p.x + 0.1, z: p.z + 0.1 }, RADIUS, [wall]);
    expect(p.z).toBeCloseTo(0, 5);
    expect(p.x).toBeCloseTo(10 - RADIUS);
  });
});

describe('corners', () => {
  const block: Box = { minX: 10, maxX: 20, minZ: 0, maxZ: 10 };

  it('rounds a corner without sticking', () => {
    let p = { x: 8, z: -3 };
    let lastZ = p.z;
    for (let i = 0; i < 120; i++) {
      p = moveWithCollisions(p, { x: p.x + 0.05, z: p.z + 0.1 }, RADIUS, [block]);
      expect(clearOf(p, block)).toBe(true);
      expect(p.z).toBeGreaterThanOrEqual(lastZ - 1e-9);
      lastZ = p.z;
    }
    expect(p.z).toBeGreaterThan(8);
  });

  it('is pushed away from the corner point, not along an axis', () => {
    const p = pushOutOfBox({ x: 9.8, z: -0.2 }, RADIUS, block);
    expect(clearOf(p, block)).toBe(true);
    expect(p.x).toBeLessThan(9.8);
    expect(p.z).toBeLessThan(-0.2);
  });
});

describe('push-out', () => {
  it('pushes a circle that starts inside a box out through the nearest face', () => {
    const p = pushOutOfBox({ x: 11, z: 0 }, RADIUS, wall);
    expect(p.x).toBeCloseTo(10 - RADIUS);
    expect(p.z).toBeCloseTo(0);
    expect(clearOf(p, wall)).toBe(true);
  });

  it('works for every face', () => {
    expect(pushOutOfBox({ x: 19, z: 0 }, RADIUS, wall).x).toBeCloseTo(20 + RADIUS);
    expect(pushOutOfBox({ x: 15, z: -9 }, RADIUS, wall).z).toBeCloseTo(-10 - RADIUS);
    expect(pushOutOfBox({ x: 15, z: 9 }, RADIUS, wall).z).toBeCloseTo(10 + RADIUS);
  });

  it('ends clear of both boxes when it overlaps one in a gap wide enough for it', () => {
    const left: Box = { minX: 0, maxX: 10, minZ: -10, maxZ: 10 };
    const right: Box = { minX: 11.4, maxX: 20, minZ: -10, maxZ: 10 };
    const p = resolveCollisions({ x: 10.2, z: 0 }, RADIUS, [left, right]);
    expect(clearOf(p, left)).toBe(true);
    expect(clearOf(p, right)).toBe(true);
    expect(p.x).toBeCloseTo(10 + RADIUS);
  });

  it('stays finite when the gap is too narrow for it', () => {
    const left: Box = { minX: 0, maxX: 10, minZ: -10, maxZ: 10 };
    const right: Box = { minX: 10.6, maxX: 20, minZ: -10, maxZ: 10 };
    const p = resolveCollisions({ x: 10.3, z: 0 }, RADIUS, [left, right]);
    expect(Number.isFinite(p.x) && Number.isFinite(p.z)).toBe(true);
  });
});

describe('with a spatial grid', () => {
  it('only considers the boxes near the circle and still blocks', () => {
    const grid = new SpatialGrid<Box>(16);
    grid.insert(wall);
    for (let i = 0; i < 200; i++) {
      grid.insert({ minX: 100 + i * 3, maxX: 101 + i * 3, minZ: 100, maxZ: 101 });
    }
    const end = moveWithCollisions({ x: 5, z: 0 }, { x: 15, z: 0 }, RADIUS, grid);
    expect(end.x).toBeCloseTo(10 - RADIUS);
  });
});
