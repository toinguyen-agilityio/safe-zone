import {
  BoxGeometry,
  BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
  MeshStandardMaterial,
} from 'three';
import { ITEM_TYPES, type ItemType } from '../entities/items';
import type { LootItem } from '../world/loot-spawn';

/** Items are drawn this much bigger than life so they can be seen from down the street. */
const SCALE = 1.8;
/** How high above the ground the middle of an item sits. */
const LIFT = 0.45;

const LOOKS: Record<ItemType, { geometry: () => BufferGeometry; color: number }> = {
  // A long golden loaf.
  banhMi: { geometry: () => new BoxGeometry(0.6, 0.22, 0.24), color: 0xd9a441 },
  // A tall green cup of sugarcane juice.
  sugarcaneJuice: { geometry: () => new CylinderGeometry(0.15, 0.12, 0.45, 12), color: 0x8fd16a },
  // A dark green crate.
  ammoBox: { geometry: () => new BoxGeometry(0.5, 0.3, 0.34), color: 0x4a5a2e },
  // A yellow rain poncho: a cone with a hood.
  raincoat: { geometry: () => new ConeGeometry(0.28, 0.6, 10), color: 0xf2d12a },
};

const itemMatrix = (x: number, z: number): Matrix4 =>
  new Matrix4().compose(
    new Vector3(x, LIFT, z),
    new Quaternion(),
    new Vector3(SCALE, SCALE, SCALE),
  );

interface Batch {
  mesh: InstancedMesh;
  /** The item id at each instance index. */
  ids: number[];
}

/**
 * Draws the items on the ground: one instanced mesh per item type. A picked up item is taken out
 * by swapping the last instance into its place, so the mesh only ever draws what is left.
 */
export class LootRenderer {
  readonly group = new Group();
  private readonly batches = new Map<ItemType, Batch>();
  private readonly where = new Map<number, ItemType>();
  private readonly items = new Map<number, LootItem>();

  constructor(items: readonly LootItem[]) {
    this.group.name = 'loot';
    for (const type of ITEM_TYPES) {
      const ofType = items.filter((i) => i.type === type);
      const look = LOOKS[type];
      const mesh = new InstancedMesh(
        look.geometry(),
        new MeshStandardMaterial({ color: look.color, roughness: 0.7 }),
        Math.max(1, ofType.length),
      );
      mesh.name = `loot-${type}`;
      mesh.frustumCulled = false;
      const batch: Batch = { mesh, ids: [] };
      for (const item of ofType) this.place(batch, item);
      mesh.count = ofType.length;
      this.batches.set(type, batch);
      this.group.add(mesh);
    }
    for (const item of items) {
      this.where.set(item.id, item.type);
      this.items.set(item.id, item);
    }
  }

  private place(batch: Batch, item: LootItem): void {
    const index = batch.ids.length;
    batch.mesh.setMatrixAt(index, itemMatrix(item.x, item.z));
    batch.ids.push(item.id);
    batch.mesh.instanceMatrix.needsUpdate = true;
  }

  /** How many items of a type are drawn. */
  count(type: ItemType): number {
    return this.batches.get(type)!.mesh.count;
  }

  /** How many items are drawn in all. */
  get total(): number {
    return ITEM_TYPES.reduce((sum, type) => sum + this.count(type), 0);
  }

  /** Stop drawing an item, for example when it has been picked up. Returns false if unknown. */
  remove(id: number): boolean {
    const type = this.where.get(id);
    if (type === undefined) return false;
    const batch = this.batches.get(type)!;
    const index = batch.ids.indexOf(id);
    const last = batch.ids.length - 1;
    if (index < 0) return false;

    if (index !== last) {
      // Move the last instance into the gap.
      const lastId = batch.ids[last]!;
      const moved = this.items.get(lastId)!;
      batch.mesh.setMatrixAt(index, itemMatrix(moved.x, moved.z));
      batch.ids[index] = lastId;
    }
    batch.ids.pop();
    batch.mesh.count = batch.ids.length;
    batch.mesh.instanceMatrix.needsUpdate = true;
    this.where.delete(id);
    return true;
  }
}
