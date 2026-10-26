import { Box3, type Mesh, type Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { getLandmarks } from '../../world/landmarks';
import { getLayout } from '../../world/layout';
import { buildWorldScene } from '../world-scene';
import { buildLandmarks, registeredLandmarks } from './index';

const layout = getLayout();
const specs = getLandmarks(layout);
const market = specs.find((s) => s.id === 'hanMarket')!;

const find = (root: Object3D, name: string) => {
  const found: Object3D[] = [];
  root.traverse((o) => {
    if (o.name === name) found.push(o);
  });
  return found;
};

describe('landmark registry', () => {
  it('loads the landmark files it finds', () => {
    expect(registeredLandmarks()).toContain('hanMarket');
  });

  it('returns the market group placed on its footprint', () => {
    const root = buildLandmarks(specs);
    const [group] = find(root, 'landmark-hanMarket');
    expect(group).toBeDefined();
    expect(group!.position.x).toBeCloseTo(market.footprint.cx);
    expect(group!.position.z).toBeCloseTo(market.footprint.cz);
  });

  it('is part of the world scene', () => {
    expect(find(buildWorldScene(layout), 'landmark-hanMarket')).toHaveLength(1);
  });
});

describe('Han Market', () => {
  const [group] = find(buildLandmarks(specs), 'landmark-hanMarket');

  it('has a Vietnamese sign reading CHỢ HÀN and no brand name', () => {
    const [sign] = find(group!, 'sign') as Mesh[];
    expect(sign!.userData.text).toBe('CHỢ HÀN');
  });

  it('stays inside its footprint and reaches roughly its height', () => {
    const box = new Box3().setFromObject(group!);
    const { footprint, height } = market;
    expect(box.max.x - box.min.x).toBeLessThanOrEqual(footprint.width);
    expect(box.max.z - box.min.z).toBeLessThanOrEqual(footprint.depth);
    expect(box.max.y).toBeGreaterThan(height * 0.8);
    expect(box.max.y).toBeLessThanOrEqual(height * 1.2);
  });
});
