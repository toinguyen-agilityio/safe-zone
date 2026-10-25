import { describe, expect, it } from 'vitest';
import { getLayout, riverCenterX } from './layout';
import type { Rect } from './types';

const layout = getLayout();
const halfRiver = layout.river.width / 2;
const half = layout.size / 2;

const inside = (r: Rect) =>
  r.cx - r.width / 2 >= -half &&
  r.cx + r.width / 2 <= half &&
  r.cz - r.depth / 2 >= -half &&
  r.cz + r.depth / 2 <= half;

describe('getLayout', () => {
  it('describes a 640x640 map', () => {
    expect(layout.size).toBe(640);
  });

  it('has streets, one river, three bridges and four landmarks', () => {
    expect(layout.streets.length).toBeGreaterThan(0);
    expect(layout.river.centerline.length).toBeGreaterThan(2);
    expect(layout.bridges).toHaveLength(3);
    expect(layout.landmarks.map((l) => l.id).sort()).toEqual([
      'chamMuseum',
      'cockChurch',
      'dragonBridge',
      'hanMarket',
    ]);
  });

  it('keeps every street clear of the river', () => {
    for (const street of layout.streets) {
      const east = street.cx + street.width / 2;
      for (let z = street.cz - street.depth / 2; z <= street.cz + street.depth / 2; z += 5) {
        expect(east).toBeLessThan(riverCenterX(z) - halfRiver);
      }
    }
  });

  it('puts every bridge across the river', () => {
    for (const bridge of layout.bridges) {
      const cx = riverCenterX(bridge.z);
      expect(bridge.xStart).toBeLessThan(cx - halfRiver);
      expect(bridge.xEnd).toBeGreaterThan(cx + halfRiver);
    }
  });

  it('keeps the river on the east side and running past the map edges', () => {
    const { centerline } = layout.river;
    expect(centerline.every((p) => p.x > 0)).toBe(true);
    expect(centerline[0]!.z).toBeLessThan(-half);
    expect(centerline[centerline.length - 1]!.z).toBeGreaterThan(half);
  });

  it('keeps landmark areas inside the map', () => {
    for (const landmark of layout.landmarks) {
      expect(inside(landmark.area)).toBe(true);
    }
  });
});
