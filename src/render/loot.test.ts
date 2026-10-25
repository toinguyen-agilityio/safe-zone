import { InstancedMesh, Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { ITEM_TYPES } from '../entities/items';
import { getLayout } from '../world/layout';
import { generateLoot, type LootItem } from '../world/loot-spawn';
import { LootRenderer } from './loot';

const items = generateLoot(getLayout());

/** Where an instance of a type is drawn, for every instance still shown. */
function positions(renderer: LootRenderer, type: string): Vector3[] {
  const mesh = renderer.group.getObjectByName(`loot-${type}`) as InstancedMesh;
  const found: Vector3[] = [];
  for (let i = 0; i < mesh.count; i++) {
    const m = new Matrix4();
    mesh.getMatrixAt(i, m);
    found.push(new Vector3().setFromMatrixPosition(m));
  }
  return found;
}

describe('LootRenderer', () => {
  it('draws one instance for each item, spread over four looks', () => {
    const renderer = new LootRenderer(items);
    expect(renderer.total).toBe(items.length);
    for (const type of ITEM_TYPES) {
      expect(renderer.count(type)).toBe(items.filter((i) => i.type === type).length);
      expect(renderer.count(type)).toBeGreaterThan(0);
    }
    expect(renderer.group.children).toHaveLength(4);
  });

  it('gives each type its own shape and color', () => {
    const renderer = new LootRenderer(items);
    const meshes = renderer.group.children as InstancedMesh[];
    expect(
      new Set(
        meshes.map(
          (m) =>
            m.geometry.type +
            (m.material as unknown as { color: { getHex(): number } }).color.getHex(),
        ),
      ).size,
    ).toBe(4);
  });

  it('puts each instance where its item lies', () => {
    const renderer = new LootRenderer(items);
    const banhMi = items.filter((i) => i.type === 'banhMi');
    const drawn = positions(renderer, 'banhMi');
    expect(drawn).toHaveLength(banhMi.length);
    for (const [i, item] of banhMi.entries()) {
      expect(drawn[i]!.x).toBeCloseTo(item.x);
      expect(drawn[i]!.z).toBeCloseTo(item.z);
      expect(drawn[i]!.y).toBeGreaterThan(0);
    }
  });

  it('stops drawing an item that was picked up', () => {
    const renderer = new LootRenderer(items);
    const victim = items[0]!;
    expect(renderer.remove(victim.id)).toBe(true);
    expect(renderer.total).toBe(items.length - 1);
    expect(renderer.count(victim.type)).toBe(
      items.filter((i) => i.type === victim.type).length - 1,
    );
    const stillThere = positions(renderer, victim.type).some(
      (p) => Math.abs(p.x - victim.x) < 1e-6 && Math.abs(p.z - victim.z) < 1e-6,
    );
    expect(stillThere).toBe(false);
  });

  it('keeps the other items of that type in place when one is removed', () => {
    const renderer = new LootRenderer(items);
    const same = items.filter((i) => i.type === items[0]!.type);
    renderer.remove(same[0]!.id);
    const drawn = positions(renderer, same[0]!.type);
    for (const item of same.slice(1)) {
      const found = drawn.some(
        (p) => Math.abs(p.x - item.x) < 0.01 && Math.abs(p.z - item.z) < 0.01,
      );
      expect(found).toBe(true);
    }
  });

  it('removes any item, the first, the last and from the middle, until none is left', () => {
    const renderer = new LootRenderer(items);
    const order = [...items].sort((a, b) => ((a.id * 7919) % 101) - ((b.id * 7919) % 101));
    for (const item of order) expect(renderer.remove(item.id)).toBe(true);
    expect(renderer.total).toBe(0);
  });

  it('does not remove the same item twice or one it never had', () => {
    const renderer = new LootRenderer(items);
    expect(renderer.remove(items[1]!.id)).toBe(true);
    expect(renderer.remove(items[1]!.id)).toBe(false);
    expect(renderer.remove(99999)).toBe(false);
    expect(renderer.total).toBe(items.length - 1);
  });

  it('handles a type with no items', () => {
    const only: LootItem[] = [{ id: 1, type: 'banhMi', x: 3, z: 4 }];
    const renderer = new LootRenderer(only);
    expect(renderer.total).toBe(1);
    expect(renderer.count('raincoat')).toBe(0);
  });
});
