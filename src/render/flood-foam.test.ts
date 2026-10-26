import { ShaderMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createFloodWater, EDGE_WIDTH, floodVisible, FOAM_WIDTH, foamFactor } from './flood-water';

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

describe('floodVisible', () => {
  const half = config.world.mapSize / 2;

  it('is false while the dry zone covers the whole map', () => {
    expect(floodVisible({ center: { x: 0, z: 0 }, radius: config.zone.startRadius })).toBe(false);
  });

  it('is true once the zone has shrunk, so there is water to see', () => {
    expect(floodVisible({ center: { x: 0, z: 0 }, radius: config.zone.radii[0] })).toBe(true);
    expect(floodVisible({ center: { x: 60, z: -40 }, radius: 130 })).toBe(true);
  });

  it('is true from the moment the circle no longer reaches a corner of the map', () => {
    const corner = Math.hypot(half, half);
    expect(floodVisible({ center: { x: 0, z: 0 }, radius: corner + 1 })).toBe(false);
    expect(floodVisible({ center: { x: 0, z: 0 }, radius: corner - 1 })).toBe(true);
  });

  it('takes the center into account: off to one side, the far corner is farther', () => {
    const corner = Math.hypot(half, half);
    expect(floodVisible({ center: { x: 100, z: 0 }, radius: corner + 1 })).toBe(true);
  });
});
