import { Box3, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { getBridges } from '../world/bridges';
import { getLayout } from '../world/layout';
import { buildDragon, dragonSpine } from './dragon';

const specs = getBridges(getLayout());
const dragonSpec = specs.find((s) => s.id === 'dragon')!;
const dragon = buildDragon(dragonSpec);

const find = (name: string) => {
  const found: Object3D[] = [];
  dragon.traverse((o) => {
    if (o.name === name) found.push(o);
  });
  return found;
};

describe('dragon head and tail', () => {
  it('has a head with a skull, a snout and exactly two horns', () => {
    expect(find('dragon-head')).toHaveLength(1);
    expect(find('dragon-skull')).toHaveLength(1);
    expect(find('dragon-snout')).toHaveLength(1);
    expect(find('dragon-horn')).toHaveLength(2);
  });

  it('has one tail', () => {
    expect(find('dragon-tail')).toHaveLength(1);
  });

  it('puts the head at the head end and the tail at the tail end', () => {
    const spine = dragonSpine(dragonSpec);
    const head = find('dragon-head')[0]!;
    const tail = new Box3().setFromObject(find('dragon-tail')[0]!);
    expect(head.position.x).toBeCloseTo(spine.getPoint(1).x);
    // The tail's round base is centered on the spine start and may tilt a little past it.
    expect(tail.max.x).toBeLessThanOrEqual(spine.getPoint(0).x + config.world.dragon.bodyRadius);
    expect(tail.min.x).toBeLessThan(spine.getPoint(0).x);
  });

  it('keeps the horns above the head', () => {
    const headBox = new Box3().setFromObject(find('dragon-skull')[0]!);
    for (const horn of find('dragon-horn')) {
      expect(new Box3().setFromObject(horn).max.y).toBeGreaterThan(headBox.max.y);
    }
  });
});

describe('getBridges head anchor', () => {
  it('exposes the head anchor for the Dragon Bridge only', () => {
    const anchors = specs.filter((s) => s.dragonHeadAnchor);
    expect(anchors.map((s) => s.id)).toEqual(['dragon']);
  });

  it('matches where the head stands', () => {
    const anchor = dragonSpec.dragonHeadAnchor!;
    const end = dragonSpine(dragonSpec).getPoint(1);
    expect(anchor.x).toBeCloseTo(end.x);
    expect(anchor.y).toBeCloseTo(end.y);
    expect(anchor.z).toBeCloseTo(end.z);
  });
});
