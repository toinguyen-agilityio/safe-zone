import { Box3, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { getLandmarks } from '../../world/landmarks';
import { getLayout } from '../../world/layout';
import { buildWorldScene } from '../world-scene';
import { buildLandmarks, registeredLandmarks } from './index';

const layout = getLayout();
const specs = getLandmarks(layout);
const church = specs.find((s) => s.id === 'cockChurch')!;

const find = (root: Object3D, name: string) => {
  const found: Object3D[] = [];
  root.traverse((o) => {
    if (o.name === name) found.push(o);
  });
  return found;
};

describe('Cock Church', () => {
  const root = buildLandmarks(specs);
  const [group] = find(root, 'landmark-cockChurch');

  it('is picked up by the registry and placed on its footprint', () => {
    expect(registeredLandmarks()).toContain('cockChurch');
    expect(group).toBeDefined();
    expect(group!.position.x).toBeCloseTo(church.footprint.cx);
    expect(group!.position.z).toBeCloseTo(church.footprint.cz);
  });

  it('has a tower with a spire and a rooster on top', () => {
    expect(find(group!, 'tower')).toHaveLength(1);
    expect(find(group!, 'spire')).toHaveLength(1);
    const rooster = find(group!, 'rooster');
    expect(rooster).toHaveLength(1);
    const roosterTop = new Box3().setFromObject(rooster[0]!).max.y;
    const spireTop = new Box3().setFromObject(find(group!, 'spire')[0]!).max.y;
    expect(roosterTop).toBeGreaterThan(spireTop);
  });

  it('stays inside its footprint and reaches roughly its height', () => {
    const box = new Box3().setFromObject(group!);
    expect(box.max.x - box.min.x).toBeLessThanOrEqual(church.footprint.width);
    expect(box.max.z - box.min.z).toBeLessThanOrEqual(church.footprint.depth);
    expect(box.max.y).toBeGreaterThan(church.height * 0.8);
    expect(box.max.y).toBeLessThanOrEqual(church.height * 1.2);
  });

  it('is part of the world scene', () => {
    expect(find(buildWorldScene(layout), 'landmark-cockChurch')).toHaveLength(1);
  });
});
