import { describe, expect, it } from 'vitest';
import { computeBlocks } from './blocks';
import { getLandmarks, reservedArea } from './landmarks';
import { getLayout, riverCenterX } from './layout';
import type { Rect } from './types';

const layout = getLayout();
const blocks = computeBlocks(layout);
const half = layout.size / 2;
const halfRiver = layout.river.width / 2;
const reserved = getLandmarks(layout).map(reservedArea);

const bounds = (r: Rect) => ({
  x0: r.cx - r.width / 2,
  x1: r.cx + r.width / 2,
  z0: r.cz - r.depth / 2,
  z1: r.cz + r.depth / 2,
});

const overlaps = (a: Rect, b: Rect) => {
  const p = bounds(a);
  const q = bounds(b);
  return p.x0 < q.x1 - 1e-9 && p.x1 > q.x0 + 1e-9 && p.z0 < q.z1 - 1e-9 && p.z1 > q.z0 + 1e-9;
};

const contains = (r: Rect, x: number, z: number) => {
  const b = bounds(r);
  return x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;
};

describe('computeBlocks', () => {
  it('returns blocks inside the map', () => {
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const b = bounds(block);
      expect(b.x0).toBeGreaterThanOrEqual(-half);
      expect(b.x1).toBeLessThanOrEqual(half);
      expect(b.z0).toBeGreaterThanOrEqual(-half);
      expect(b.z1).toBeLessThanOrEqual(half);
    }
  });

  it('does not overlap any street', () => {
    for (const block of blocks) {
      for (const street of layout.streets) expect(overlaps(block, street)).toBe(false);
    }
  });

  it('does not overlap the river', () => {
    for (const block of blocks) {
      const b = bounds(block);
      for (let z = b.z0; z <= b.z1; z += 1) {
        expect(b.x1).toBeLessThanOrEqual(riverCenterX(z) - halfRiver + 1e-9);
      }
    }
  });

  it('does not overlap other blocks or bridge decks', () => {
    blocks.forEach((a, i) => {
      for (const other of blocks.slice(i + 1)) expect(overlaps(a, other)).toBe(false);
      for (const bridge of layout.bridges) {
        const deck: Rect = {
          cx: (bridge.xStart + bridge.xEnd) / 2,
          cz: bridge.z,
          width: bridge.xEnd - bridge.xStart,
          depth: bridge.deckWidth,
        };
        expect(overlaps(a, deck)).toBe(false);
      }
    });
  });

  it('covers all land between the streets that is clear of the river and bridges', () => {
    let lowestBank = Infinity;
    for (let z = -half; z <= half; z += 1) {
      lowestBank = Math.min(lowestBank, riverCenterX(z) - halfRiver);
    }
    const nearBridge = (z: number) =>
      layout.bridges.some((b) => Math.abs(z - b.z) <= b.deckWidth / 2 + 1);
    for (let x = -half + 1; x < lowestBank; x += 4) {
      for (let z = -half + 1; z < half; z += 4) {
        const onStreet = layout.streets.some((s) => contains(s, x, z));
        const onLandmark = reserved.some((r) => contains(r, x, z));
        if (onStreet || nearBridge(z) || onLandmark) continue;
        expect(blocks.some((b) => contains(b, x, z))).toBe(true);
      }
    }
  });
});
