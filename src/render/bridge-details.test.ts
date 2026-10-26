import { Box3, type Mesh, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { getBridges } from '../world/bridges';
import { getLayout } from '../world/layout';
import { buildBridgeDetails } from './bridge-details';
import { buildBridges } from './bridges';

const specs = getBridges(getLayout());
const { waterLevel } = config.world.river;

const find = (root: Object3D, name: string) => {
  const found: Object3D[] = [];
  root.traverse((o) => {
    if (o.name === name) found.push(o);
  });
  return found;
};

describe('buildBridgeDetails', () => {
  it('builds as many railings and pillars as the spec lists', () => {
    for (const spec of specs) {
      const details = buildBridgeDetails(spec);
      expect(find(details, 'railing')).toHaveLength(spec.railings.length);
      expect(find(details, 'pillar')).toHaveLength(spec.pillars.length);
    }
  });

  it('runs each railing up the ramp, along the deck and down again', () => {
    for (const spec of specs) {
      for (const railing of find(buildBridgeDetails(spec), 'railing')) {
        expect(railing.children).toHaveLength(3);
        const box = new Box3().setFromObject(railing);
        expect(box.min.x).toBeLessThanOrEqual(spec.rampStartX + 1);
        expect(box.max.x).toBeGreaterThanOrEqual(spec.rampEndX - 1);
        expect(box.max.y).toBeGreaterThan(spec.deckHeight);
      }
    }
  });

  it('stands pillars in the water from the bed up to the deck', () => {
    for (const spec of specs) {
      for (const pillar of find(buildBridgeDetails(spec), 'pillar')) {
        const box = new Box3().setFromObject(pillar);
        expect(box.min.y).toBeLessThan(waterLevel);
        expect(box.max.y).toBeCloseTo(spec.deckHeight);
      }
    }
  });
});

describe('open space under the deck', () => {
  it('has nothing between the water and the deck except pillars', () => {
    const root = buildBridges(specs);
    for (const spec of specs) {
      const group = root.getObjectByName(`bridge-${spec.id}`)!;
      group.traverse((o) => {
        const mesh = o as Mesh;
        if (!mesh.isMesh || mesh.name === 'pillar') return;
        const box = new Box3().setFromObject(mesh);
        const overRiver = box.min.x > spec.deckStartX + 0.5 && box.max.x < spec.deckEndX - 0.5;
        if (overRiver) expect(box.min.y).toBeGreaterThan(spec.deckHeight - 1);
      });
    }
  });
});
