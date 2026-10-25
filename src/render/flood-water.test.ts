import { ShaderMaterial } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createFloodWater, floodUniforms, WATER_HEIGHT } from './flood-water';

const zone = { center: { x: -40, z: 25 }, radius: 130 };

describe('floodUniforms', () => {
  it('takes the center and radius from the zone state', () => {
    expect(floodUniforms(zone)).toEqual({ center: [-40, 25], radius: 130 });
  });
});

describe('createFloodWater', () => {
  it('covers the whole map and sits just above the road', () => {
    const { mesh } = createFloodWater();
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry.boundingBox!;
    expect(box.max.x - box.min.x).toBeGreaterThanOrEqual(config.world.mapSize);
    expect(box.max.z - box.min.z).toBeGreaterThanOrEqual(config.world.mapSize);
    expect(mesh.position.y).toBe(WATER_HEIGHT);
    expect(mesh.position.y).toBeGreaterThan(config.world.roadLevel);
  });

  it('starts with the dry zone covering the map', () => {
    const { mesh } = createFloodWater();
    const material = mesh.material as ShaderMaterial;
    expect(material.uniforms.uRadius!.value).toBe(config.zone.startRadius);
  });

  it('follows the zone every frame', () => {
    const water = createFloodWater();
    const material = water.mesh.material as ShaderMaterial;
    water.update(zone, 3.5);
    expect(material.uniforms.uCenter!.value.toArray()).toEqual([-40, 25]);
    expect(material.uniforms.uRadius!.value).toBe(130);
    expect(material.uniforms.uTime!.value).toBe(3.5);
    // The zone shrinks and moves: the next frame reads the new values.
    water.update({ center: { x: 10, z: 5 }, radius: 100 }, 4);
    expect(material.uniforms.uCenter!.value.toArray()).toEqual([10, 5]);
    expect(material.uniforms.uRadius!.value).toBe(100);
  });

  it('discards the dry zone in the shader and is see-through', () => {
    const material = createFloodWater().mesh.material as ShaderMaterial;
    expect(material.fragmentShader).toContain('discard');
    expect(material.fragmentShader).toContain('uRadius');
    expect(material.transparent).toBe(true);
  });
});
