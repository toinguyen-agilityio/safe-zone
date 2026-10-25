import { Box3, Group } from 'three';
import { describe, expect, it } from 'vitest';
import { getBridges } from '../world/bridges';
import { getLayout } from '../world/layout';
import { buildBridges } from './bridges';
import { buildWorldScene } from './world-scene';

const layout = getLayout();
const specs = getBridges(layout);
const root = buildBridges(specs);

describe('buildBridges', () => {
  it('builds one group per bridge, each with a deck and two ramps', () => {
    expect(root.children).toHaveLength(3);
    for (const group of root.children) {
      const names = group.children.map((c) => c.name);
      expect(names.filter((n) => n === 'deck')).toHaveLength(1);
      expect(names.filter((n) => n === 'ramp')).toHaveLength(2);
    }
  });

  it('puts each bridge at its layout position and spans the river', () => {
    for (const spec of specs) {
      const group = root.getObjectByName(`bridge-${spec.id}`) as Group;
      const box = new Box3().setFromObject(group);
      expect(box.min.x).toBeLessThanOrEqual(spec.rampStartX + 1);
      expect(box.max.x).toBeGreaterThanOrEqual(spec.rampEndX - 1);
      expect((box.min.z + box.max.z) / 2).toBeCloseTo(spec.z);
    }
  });

  it('raises the deck and brings the ramps down to the ground', () => {
    for (const spec of specs) {
      const group = root.getObjectByName(`bridge-${spec.id}`) as Group;
      const deck = new Box3().setFromObject(group.getObjectByName('deck')!);
      expect(deck.max.y).toBeCloseTo(spec.deckHeight);
      const ramps = group.children.filter((c) => c.name === 'ramp');
      for (const ramp of ramps) {
        const box = new Box3().setFromObject(ramp);
        expect(box.min.y).toBeLessThan(0.5);
        expect(box.max.y).toBeGreaterThan(spec.deckHeight - 0.5);
      }
    }
  });

  it('is part of the world scene', () => {
    const names: string[] = [];
    buildWorldScene(layout).traverse((o) => names.push(o.name));
    expect(names).toContain('bridges');
  });
});
