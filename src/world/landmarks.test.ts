import { describe, expect, it } from 'vitest';
import { computeBlocks } from './blocks';
import { generateHouses } from './houses';
import { getLandmarks, reservedArea } from './landmarks';
import { getLayout, riverCenterX } from './layout';
import type { Rect } from './types';

const layout = getLayout();
const landmarks = getLandmarks(layout);
const halfRiver = layout.river.width / 2;

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

describe('getLandmarks', () => {
  it('returns Han Market, Cock Church and Cham Museum with a footprint and height', () => {
    expect(landmarks.map((l) => l.name).sort()).toEqual([
      'Cham Museum',
      'Cock Church',
      'Han Market',
    ]);
    for (const landmark of landmarks) {
      expect(landmark.footprint.width).toBeGreaterThan(0);
      expect(landmark.footprint.depth).toBeGreaterThan(0);
      expect(landmark.height).toBeGreaterThan(0);
    }
  });

  it('keeps every footprint off the streets and the river', () => {
    for (const landmark of landmarks) {
      const area = reservedArea(landmark);
      for (const street of layout.streets) expect(overlaps(area, street)).toBe(false);
      const b = bounds(area);
      for (let z = b.z0; z <= b.z1; z += 1) {
        expect(b.x1).toBeLessThanOrEqual(riverCenterX(z) - halfRiver);
      }
    }
  });
});

describe('landmarks and blocks', () => {
  it('cuts the footprints out of the blocks', () => {
    for (const block of computeBlocks(layout)) {
      for (const landmark of landmarks) expect(overlaps(block, landmark.footprint)).toBe(false);
    }
  });

  it('keeps every house clear of every landmark', () => {
    const { houses } = generateHouses(layout, 4242);
    expect(houses.length).toBeGreaterThan(200);
    for (const house of houses) {
      for (const landmark of landmarks) expect(overlaps(house, landmark.footprint)).toBe(false);
    }
  });
});
