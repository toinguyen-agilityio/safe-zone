import { AdditiveBlending, BufferAttribute, BufferGeometry, Line, LineBasicMaterial } from 'three';
import type { Object3D } from 'three';
import type { Vec3 } from '../systems/fire-control';

/** Seconds a tracer stays visible while it fades out. */
export const TRACER_SECONDS = 0.08;
/** How far a tracer reaches along the shot. */
export const TRACER_LENGTH = 120;
/** Tracers alive at once; at ten shots a second this is more than ever shows. */
const POOL_SIZE = 16;
/** Where the bullet appears, from the eyes: forward, to the right and down to the muzzle. */
const MUZZLE = { forward: 0.9, right: 0.2, down: 0.18 };

interface Slot {
  line: Line;
  positions: BufferAttribute;
  /** Seconds left; 0 means free. */
  left: number;
}

/** A fixed set of lines reused for every shot, so firing allocates nothing. */
export class TracerPool {
  private readonly slots: Slot[] = [];
  private next = 0;

  constructor(parent: Object3D, size: number = POOL_SIZE) {
    for (let i = 0; i < size; i++) {
      const geometry = new BufferGeometry();
      const positions = new BufferAttribute(new Float32Array(6), 3);
      geometry.setAttribute('position', positions);
      const material = new LineBasicMaterial({
        color: 0xffe9a0,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      });
      const line = new Line(geometry, material);
      line.frustumCulled = false;
      line.visible = false;
      parent.add(line);
      this.slots.push({ line, positions, left: 0 });
    }
  }

  /** Lines currently showing. */
  get active(): number {
    return this.slots.filter((s) => s.left > 0).length;
  }

  /** Start a tracer for a shot leaving `origin` along the unit vector `direction`. */
  fire(origin: Vec3, direction: Vec3): void {
    // Take the next slot in turn; when all are busy the oldest one is reused.
    const slot = this.slots[this.next]!;
    this.next = (this.next + 1) % this.slots.length;

    // Sideways is perpendicular to the look direction on the ground plane.
    const flat = Math.hypot(direction.x, direction.z) || 1;
    const rx = -direction.z / flat;
    const rz = direction.x / flat;
    const sx = origin.x + direction.x * MUZZLE.forward + rx * MUZZLE.right;
    const sy = origin.y + direction.y * MUZZLE.forward - MUZZLE.down;
    const sz = origin.z + direction.z * MUZZLE.forward + rz * MUZZLE.right;
    slot.positions.setXYZ(0, sx, sy, sz);
    slot.positions.setXYZ(
      1,
      origin.x + direction.x * TRACER_LENGTH,
      origin.y + direction.y * TRACER_LENGTH,
      origin.z + direction.z * TRACER_LENGTH,
    );
    slot.positions.needsUpdate = true;
    slot.left = TRACER_SECONDS;
    slot.line.visible = true;
    (slot.line.material as LineBasicMaterial).opacity = 1;
  }

  update(dt: number): void {
    for (const slot of this.slots) {
      if (slot.left <= 0) continue;
      slot.left = Math.max(0, slot.left - dt);
      slot.line.visible = slot.left > 0;
      (slot.line.material as LineBasicMaterial).opacity = slot.left / TRACER_SECONDS;
    }
  }

  get size(): number {
    return this.slots.length;
  }
}
