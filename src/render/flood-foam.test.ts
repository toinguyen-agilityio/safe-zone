import { ShaderMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { createFloodWater, EDGE_WIDTH, FOAM_WIDTH, foamFactor } from './flood-water';

describe('foamFactor', () => {
  it('is full right at the edge of the dry zone', () => {
    expect(foamFactor(100, 100)).toBe(1);
  });

  it('is nothing inside the dry zone, where there is no water', () => {
    expect(foamFactor(50, 100)).toBe(0);
    expect(foamFactor(0, 100)).toBe(0);
  });

  it('fades to nothing at the band width and beyond', () => {
    expect(foamFactor(100 + FOAM_WIDTH, 100)).toBe(0);
    expect(foamFactor(400, 100)).toBe(0);
  });

  it('falls steadily across the band', () => {
    let last = Infinity;
    for (let d = 0; d <= FOAM_WIDTH; d += FOAM_WIDTH / 10) {
      const foam = foamFactor(100 + d, 100);
      expect(foam).toBeLessThanOrEqual(last);
      expect(foam).toBeGreaterThanOrEqual(0);
      expect(foam).toBeLessThanOrEqual(1);
      last = foam;
    }
    expect(foamFactor(100 + FOAM_WIDTH / 2, 100)).toBeCloseTo(0.5, 2);
  });

  it('moves with the radius as the zone shrinks', () => {
    expect(foamFactor(130, 130)).toBe(1);
    expect(foamFactor(130, 100)).toBe(0);
  });

  it('is at least as wide as the soft edge of the water', () => {
    expect(FOAM_WIDTH).toBeGreaterThanOrEqual(EDGE_WIDTH);
  });
});

describe('the water shader', () => {
  it('draws foam with the same band width', () => {
    const material = createFloodWater().mesh.material as ShaderMaterial;
    expect(material.fragmentShader).toContain('foam');
    expect(material.fragmentShader).toContain(FOAM_WIDTH.toFixed(2));
  });
});
