import { InstancedMesh } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { generateHouses } from '../world/houses';
import { getLayout } from '../world/layout';
import { buildHouses } from './houses';
import { buildWorldScene } from './world-scene';

const layout = getLayout();
const { houses } = generateHouses(layout, config.world.defaultSeed);

describe('buildHouses', () => {
  it('draws all houses as one InstancedMesh', () => {
    const mesh = buildHouses(houses);
    expect(mesh).toBeInstanceOf(InstancedMesh);
    expect(mesh.count).toBe(houses.length);
  });

  it('is part of the world scene exactly once', () => {
    const found: InstancedMesh[] = [];
    buildWorldScene(layout).traverse((o) => {
      if (o.name === 'houses') found.push(o as InstancedMesh);
    });
    expect(found).toHaveLength(1);
    expect(found[0]!.count).toBe(houses.length);
  });

  it('places each instance at its house with its size', () => {
    const mesh = buildHouses(houses);
    const house = houses[0]!;
    const m = new (mesh.instanceMatrix.array.constructor as Float32ArrayConstructor)(
      mesh.instanceMatrix.array.slice(0, 16),
    );
    expect(m[0]).toBeCloseTo(house.width);
    expect(m[5]).toBeCloseTo(house.height);
    expect(m[10]).toBeCloseTo(house.depth);
    expect(m[12]).toBeCloseTo(house.cx);
    expect(m[14]).toBeCloseTo(house.cz);
  });
});
