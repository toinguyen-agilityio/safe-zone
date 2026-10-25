import { describe, expect, it } from 'vitest';
import { generateHouses } from './houses';
import { getLayout, riverCenterX } from './layout';
import type { Rect } from './types';

const layout = getLayout();
const seed = 12345;
const city = generateHouses(layout, seed);
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

describe('generateHouses', () => {
  it('builds a plausible number of houses and some alleys', () => {
    expect(city.houses.length).toBeGreaterThan(200);
    expect(city.houses.length).toBeLessThan(5000);
    expect(city.alleys.length).toBeGreaterThan(10);
  });

  it('makes tube houses: a narrow frontage on a longer depth', () => {
    const tube = city.houses.filter((h) => Math.min(h.width, h.depth) <= 9);
    expect(tube.length / city.houses.length).toBeGreaterThan(0.9);
  });

  it('keeps every house off the streets and the river', () => {
    for (const house of city.houses) {
      for (const street of layout.streets) expect(overlaps(house, street)).toBe(false);
      const b = bounds(house);
      for (let z = b.z0; z <= b.z1; z += 1) {
        expect(b.x1).toBeLessThanOrEqual(riverCenterX(z) - halfRiver + 1e-9);
      }
    }
  });

  it('keeps houses apart from each other and from alleys', () => {
    city.houses.forEach((a, i) => {
      for (const b of city.houses.slice(i + 1)) expect(overlaps(a, b)).toBe(false);
      for (const alley of city.alleys) expect(overlaps(a, alley)).toBe(false);
    });
  });

  it('gives the same houses for the same seed', () => {
    expect(generateHouses(layout, seed)).toEqual(city);
  });

  it('gives different houses for a different seed', () => {
    expect(generateHouses(layout, seed + 1)).not.toEqual(city);
  });
});
