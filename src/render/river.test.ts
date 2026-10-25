import { Box3 } from 'three';
import { describe, expect, it } from 'vitest';
import { getLayout } from '../world/layout';
import { buildRiver } from './river';
import { buildWorldScene } from './world-scene';

const layout = getLayout();
const half = layout.size / 2;

describe('buildRiver', () => {
  const river = buildRiver(layout);
  const box = new Box3().setFromObject(river);

  it('extends beyond the map bounds on both ends', () => {
    expect(box.min.z).toBeLessThan(-half);
    expect(box.max.z).toBeGreaterThan(half);
  });

  it('is cut below ground level', () => {
    expect(box.min.y).toBeLessThan(0);
    expect(box.max.y).toBeLessThanOrEqual(0);
  });

  it('has a bed, banks and a water surface', () => {
    const names = river.children.map((c) => c.name);
    expect(names).toContain('river-bed');
    expect(names).toContain('water');
    expect(names.filter((n) => n === 'bank')).toHaveLength(2);
  });

  it('is part of the world scene', () => {
    const names: string[] = [];
    buildWorldScene(layout).traverse((o) => names.push(o.name));
    expect(names).toContain('river');
  });
});

describe('ground around the river', () => {
  it('has grass on both sides of the river that reaches past the map edge', () => {
    const grass: Box3[] = [];
    buildWorldScene(layout).traverse((o) => {
      if (o.name === 'grass') grass.push(new Box3().setFromObject(o));
    });
    expect(grass).toHaveLength(2);
    for (const box of grass) {
      expect(box.min.z).toBeLessThan(-half);
      expect(box.max.z).toBeGreaterThan(half);
    }
  });
});
