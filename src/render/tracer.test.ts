import { Group, Scene } from 'three';
import { describe, expect, it } from 'vitest';
import { FLASH_SECONDS, MuzzleFlash } from './muzzle-flash';
import { TRACER_LENGTH, TRACER_SECONDS, TracerPool } from './tracer';

const origin = { x: 1, y: 2, z: 3 };
const forward = { x: 0, y: 0, z: -1 };

describe('TracerPool', () => {
  it('shows a tracer that fades and then disappears', () => {
    const scene = new Scene();
    const pool = new TracerPool(scene, 4);
    pool.fire(origin, forward);
    expect(pool.active).toBe(1);
    pool.update(TRACER_SECONDS / 2);
    expect(pool.active).toBe(1);
    pool.update(TRACER_SECONDS);
    expect(pool.active).toBe(0);
    expect(scene.children.every((c) => !c.visible)).toBe(true);
  });

  it('runs the line along the shot', () => {
    const scene = new Scene();
    const pool = new TracerPool(scene, 2);
    pool.fire(origin, forward);
    const line = scene.children[0] as unknown as {
      geometry: { getAttribute: (n: string) => { getZ: (i: number) => number } };
    };
    const positions = line.geometry.getAttribute('position');
    expect(positions.getZ(1)).toBeCloseTo(3 - TRACER_LENGTH);
  });

  it('reuses its lines instead of adding more', () => {
    const scene = new Scene();
    const pool = new TracerPool(scene, 3);
    const before = scene.children.slice();
    for (let i = 0; i < 20; i++) pool.fire(origin, forward);
    expect(scene.children).toHaveLength(3);
    expect(scene.children).toEqual(before);
    expect(pool.active).toBe(3);
    expect(pool.size).toBe(3);
  });
});

describe('MuzzleFlash', () => {
  it('lights for an instant and goes out', () => {
    const rifle = new Group();
    const flash = new MuzzleFlash(rifle);
    expect(flash.lit).toBe(false);
    flash.flash();
    expect(flash.lit).toBe(true);
    expect(flash.mesh.visible).toBe(true);
    flash.update(FLASH_SECONDS * 2);
    expect(flash.lit).toBe(false);
    expect(flash.mesh.visible).toBe(false);
  });

  it('is attached to the rifle', () => {
    const rifle = new Group();
    const flash = new MuzzleFlash(rifle);
    expect(flash.mesh.parent).toBe(rifle);
  });
});
