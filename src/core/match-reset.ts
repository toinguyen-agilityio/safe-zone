import type { BufferGeometry, Material, Object3D, Texture } from 'three';

/** Collects everything a match sets up that must be taken down again, and runs it once. */
export class Disposer {
  private readonly tasks: (() => void)[] = [];
  private done = false;

  /** Run `task` when the match is disposed. A task added after that runs at once. */
  add(task: () => void): void {
    if (this.done) task();
    else this.tasks.push(task);
  }

  /** Add an event listener now and remove it when the match is disposed. */
  listen<K extends string>(
    target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>,
    type: K,
    handler: (event: Event) => void,
  ): void {
    target.addEventListener(type, handler);
    this.add(() => target.removeEventListener(type, handler));
  }

  get disposed(): boolean {
    return this.done;
  }

  /** Run every task, the last added first. Calling it again does nothing. */
  dispose(): void {
    if (this.done) return;
    this.done = true;
    for (const task of this.tasks.splice(0).reverse()) task();
  }
}

const TEXTURE_SLOTS = ['map', 'alphaMap', 'normalMap', 'roughnessMap', 'emissiveMap'] as const;

function disposeMaterial(material: Material): void {
  const slots = material as unknown as Record<string, Texture | undefined | null>;
  for (const slot of TEXTURE_SLOTS) slots[slot]?.dispose();
  material.dispose();
}

/**
 * Free the graphics memory of everything under `root`: geometries, materials with their textures
 * and instanced meshes. The objects are taken out of their parents too, so the scene is empty.
 */
export function disposeObject(root: Object3D): void {
  const seenGeometry = new Set<BufferGeometry>();
  const seenMaterial = new Set<Material>();
  root.traverse((object) => {
    const mesh = object as Object3D & {
      geometry?: BufferGeometry;
      material?: Material | Material[];
      dispose?: () => void;
    };
    if (mesh.geometry && !seenGeometry.has(mesh.geometry)) {
      seenGeometry.add(mesh.geometry);
      mesh.geometry.dispose();
    }
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of materials) {
      if (seenMaterial.has(material)) continue;
      seenMaterial.add(material);
      disposeMaterial(material);
    }
    // An instanced mesh holds its own buffers.
    if (typeof mesh.dispose === 'function' && 'instanceMatrix' in mesh) mesh.dispose();
  });
  for (const child of [...root.children]) root.remove(child);
}
