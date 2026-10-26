import { describe, expect, it } from 'vitest';
import { createWaterWall, wallPlacement, WALL_HEIGHT } from './water-wall';

const zone = { center: { x: 60, z: -35 }, radius: 130 };

describe('wallPlacement', () => {
  it('takes position and radius from the zone state', () => {
    expect(wallPlacement(zone)).toEqual({ x: 60, z: -35, radius: 130 });
  });
});

describe('createWaterWall', () => {
  it('is an open cylinder standing on the ground', () => {
    const { mesh } = createWaterWall();
    expect(mesh.geometry.type).toBe('CylinderGeometry');
    const params = (mesh.geometry as unknown as { parameters: { openEnded: boolean } }).parameters;
    expect(params.openEnded).toBe(true);
    expect(mesh.position.y).toBe(WALL_HEIGHT / 2);
  });

  it('moves and scales to the zone, keeping its height', () => {
    const wall = createWaterWall();
    wall.update(zone);
    expect(wall.mesh.position.x).toBe(60);
    expect(wall.mesh.position.z).toBe(-35);
    expect(wall.mesh.scale.x).toBe(130);
    expect(wall.mesh.scale.z).toBe(130);
    expect(wall.mesh.scale.y).toBe(1);
  });

  it('follows the shrink on every update', () => {
    const wall = createWaterWall();
    let last = Infinity;
    for (let radius = 230; radius >= 6; radius -= 20) {
      wall.update({ center: { x: radius / 2, z: 0 }, radius });
      expect(wall.mesh.scale.x).toBeLessThan(last);
      expect(wall.mesh.position.x).toBe(radius / 2);
      last = wall.mesh.scale.x;
    }
  });

  it('sits right on the circle edge: its unit radius is scaled to the zone radius', () => {
    const wall = createWaterWall();
    wall.update(zone);
    wall.mesh.geometry.computeBoundingBox();
    const box = wall.mesh.geometry.boundingBox!;
    expect((box.max.x - box.min.x) / 2).toBeCloseTo(1, 2);
    expect(((box.max.x - box.min.x) / 2) * wall.mesh.scale.x).toBeCloseTo(zone.radius, 0);
  });

  it('is see-through', () => {
    const material = createWaterWall().mesh.material as { transparent: boolean; opacity: number };
    expect(material.transparent).toBe(true);
    expect(material.opacity).toBeLessThan(1);
  });
});
