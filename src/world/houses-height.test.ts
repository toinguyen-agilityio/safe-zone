import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { generateHouses } from './houses';
import { getLayout, riverCenterX } from './layout';

const layout = getLayout();
const { houses } = generateHouses(layout, 777);
const halfRiver = layout.river.width / 2;
const { riverBand, innerHeight, riverHeight } = config.world.houses;

const distance = (h: (typeof houses)[number]) =>
  riverCenterX(h.cz) - halfRiver - (h.cx + h.width / 2);
const average = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

const riverSide = houses.filter((h) => distance(h) <= riverBand);
const inner = houses.filter((h) => distance(h) > riverBand);

describe('house heights', () => {
  it('has houses on both the river side and the inside', () => {
    expect(riverSide.length).toBeGreaterThan(0);
    expect(inner.length).toBeGreaterThan(0);
  });

  it('makes river-side houses taller than the inner average', () => {
    const innerAverage = average(inner.map((h) => h.height));
    for (const house of riverSide) expect(house.height).toBeGreaterThan(innerAverage);
  });

  it('keeps heights inside the configured ranges', () => {
    for (const h of riverSide) {
      expect(h.height).toBeGreaterThanOrEqual(riverHeight.min);
      expect(h.height).toBeLessThanOrEqual(riverHeight.max);
    }
    for (const h of inner) {
      expect(h.height).toBeGreaterThanOrEqual(innerHeight.min);
      expect(h.height).toBeLessThanOrEqual(innerHeight.max);
    }
  });

  it('gives the same heights for the same seed', () => {
    expect(generateHouses(layout, 777).houses).toEqual(houses);
  });
});
