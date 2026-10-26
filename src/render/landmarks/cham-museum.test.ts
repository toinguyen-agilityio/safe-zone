import { Box3, type Mesh, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { getLandmarks } from '../../world/landmarks';
import { getLayout } from '../../world/layout';
import { buildWorldScene } from '../world-scene';
import { buildLandmarks, registeredLandmarks } from './index';

const layout = getLayout();
const specs = getLandmarks(layout);
const museum = specs.find((s) => s.id === 'chamMuseum')!;

const find = (root: Object3D, name: string) => {
  const found: Object3D[] = [];
  root.traverse((o) => {
    if (o.name === name) found.push(o);
  });
  return found;
};

describe('Cham Museum', () => {
  const [group] = find(buildLandmarks(specs), 'landmark-chamMuseum');

  it('is picked up by the registry and placed on its footprint', () => {
    expect(registeredLandmarks()).toContain('chamMuseum');
    expect(group).toBeDefined();
    expect(group!.position.x).toBeCloseTo(museum.footprint.cx);
    expect(group!.position.z).toBeCloseTo(museum.footprint.cz);
  });

  it('has stepped Cham towers and a hall', () => {
    expect(find(group!, 'hall')).toHaveLength(1);
    const towers = find(group!, 'cham-tower');
    expect(towers.length).toBeGreaterThanOrEqual(3);
    for (const tower of towers) {
      expect(tower.children.filter((c) => c.name === 'tower-tier').length).toBeGreaterThanOrEqual(
        3,
      );
    }
  });

  it('has a Vietnamese sign without a brand name', () => {
    const [sign] = find(group!, 'sign') as Mesh[];
    expect(sign!.userData.text).toBe('BẢO TÀNG CHĂM');
  });

  it('stays inside its footprint and reaches roughly its height', () => {
    const box = new Box3().setFromObject(group!);
    expect(box.max.x - box.min.x).toBeLessThanOrEqual(museum.footprint.width);
    expect(box.max.z - box.min.z).toBeLessThanOrEqual(museum.footprint.depth);
    expect(box.max.y).toBeGreaterThan(museum.height * 0.8);
    expect(box.max.y).toBeLessThanOrEqual(museum.height * 1.3);
  });

  it('is part of the world scene', () => {
    expect(find(buildWorldScene(layout), 'landmark-chamMuseum')).toHaveLength(1);
  });
});
