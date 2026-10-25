import { Box3, type Mesh, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { getBridges } from '../world/bridges';
import { getLayout } from '../world/layout';
import { buildBridges } from './bridges';
import { buildDragon, dragonSpine } from './dragon';

const specs = getBridges(getLayout());
const dragonSpec = specs.find((s) => s.id === 'dragon')!;

const bodies = (root: Object3D) => {
  const found: Object3D[] = [];
  root.traverse((o) => {
    if (o.name === 'dragon-body') found.push(o);
  });
  return found;
};

describe('buildDragon', () => {
  const dragon = buildDragon(dragonSpec);

  it('creates a tube-shaped body mesh', () => {
    const [body] = bodies(dragon) as Mesh[];
    expect(body).toBeDefined();
    expect(body!.geometry.type).toBe('TubeGeometry');
  });

  it('runs along the whole bridge and above the deck', () => {
    const box = new Box3().setFromObject(dragon);
    expect(box.min.x).toBeLessThan(dragonSpec.deckStartX);
    expect(box.max.x).toBeGreaterThan(dragonSpec.deckEndX);
    expect(box.max.y).toBeGreaterThan(dragonSpec.deckHeight);
  });

  it('stays within the width of the deck', () => {
    const box = new Box3().setFromObject(dragon);
    expect(box.min.z).toBeGreaterThanOrEqual(dragonSpec.z - dragonSpec.deckWidth / 2);
    expect(box.max.z).toBeLessThanOrEqual(dragonSpec.z + dragonSpec.deckWidth / 2);
  });

  it('has a spine from the tail end to the head end', () => {
    const spine = dragonSpine(dragonSpec);
    expect(spine.getPoint(0).x).toBeLessThan(spine.getPoint(1).x);
  });
});

describe('dragon on the bridges', () => {
  const root = buildBridges(specs);

  it('is attached to the Dragon Bridge only', () => {
    expect(bodies(root.getObjectByName('bridge-dragon')!)).toHaveLength(1);
    expect(bodies(root.getObjectByName('bridge-han')!)).toHaveLength(0);
    expect(bodies(root.getObjectByName('bridge-tranThiLy')!)).toHaveLength(0);
    expect(bodies(root)).toHaveLength(1);
  });
});
