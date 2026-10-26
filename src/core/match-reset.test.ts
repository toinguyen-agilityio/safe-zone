import {
  BoxGeometry,
  CanvasTexture,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Scene,
} from 'three';
import { describe, expect, it } from 'vitest';
import { Input } from './input';
import { Disposer, disposeObject } from './match-reset';

/** A target that counts the listeners currently on it. */
class FakeTarget {
  readonly listeners = new Map<string, Set<(e: Event) => void>>();
  addEventListener(type: string, handler: (e: Event) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }
  removeEventListener(type: string, handler: (e: Event) => void) {
    this.listeners.get(type)?.delete(handler);
  }
  dispatchEvent() {
    return true;
  }
  get count() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}

describe('Disposer', () => {
  it('runs every task once, the last added first', () => {
    const log: string[] = [];
    const d = new Disposer();
    d.add(() => log.push('a'));
    d.add(() => log.push('b'));
    d.dispose();
    d.dispose();
    expect(log).toEqual(['b', 'a']);
    expect(d.disposed).toBe(true);
  });

  it('removes the listeners it added', () => {
    const target = new FakeTarget();
    const d = new Disposer();
    d.listen(target, 'resize', () => undefined);
    d.listen(target, 'keydown', () => undefined);
    expect(target.count).toBe(2);
    d.dispose();
    expect(target.count).toBe(0);
  });

  it('runs a task added after disposal at once', () => {
    const d = new Disposer();
    d.dispose();
    let ran = false;
    d.add(() => (ran = true));
    expect(ran).toBe(true);
  });
});

describe('disposeObject', () => {
  function spyMesh() {
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial();
    const log: string[] = [];
    geometry.addEventListener('dispose', () => log.push('geometry'));
    material.addEventListener('dispose', () => log.push('material'));
    return { mesh: new Mesh(geometry, material), log };
  }

  it('disposes the geometry and material of every mesh under the root', () => {
    const scene = new Scene();
    const group = new Group();
    const a = spyMesh();
    const b = spyMesh();
    group.add(a.mesh);
    scene.add(group, b.mesh);
    disposeObject(scene);
    expect(a.log.sort()).toEqual(['geometry', 'material']);
    expect(b.log.sort()).toEqual(['geometry', 'material']);
  });

  it('disposes a shared geometry or material only once', () => {
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial();
    let count = 0;
    geometry.addEventListener('dispose', () => count++);
    material.addEventListener('dispose', () => count++);
    const scene = new Scene();
    scene.add(new Mesh(geometry, material), new Mesh(geometry, material));
    disposeObject(scene);
    expect(count).toBe(2);
  });

  it('disposes the textures of a material and arrays of materials', () => {
    const texture = new CanvasTexture({} as HTMLCanvasElement);
    let freed = false;
    texture.addEventListener('dispose', () => (freed = true));
    const textured = new MeshBasicMaterial({ map: texture });
    const plain = new MeshBasicMaterial();
    const scene = new Scene();
    scene.add(new Mesh(new BoxGeometry(), [textured, plain]));
    disposeObject(scene);
    expect(freed).toBe(true);
  });

  it('frees instanced meshes', () => {
    const mesh = new InstancedMesh(new BoxGeometry(), new MeshBasicMaterial(), 4);
    let freed = false;
    mesh.addEventListener('dispose', () => (freed = true));
    const scene = new Scene();
    scene.add(mesh);
    disposeObject(scene);
    expect(freed).toBe(true);
  });

  it('empties the scene', () => {
    const scene = new Scene();
    scene.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()), new Group());
    disposeObject(scene);
    expect(scene.children).toHaveLength(0);
  });
});

describe('Input.dispose', () => {
  it('takes every listener off the page', () => {
    const doc = Object.assign(new FakeTarget(), { pointerLockElement: null });
    const element = new FakeTarget();
    const input = new Input(doc, element);
    expect(doc.count).toBeGreaterThan(0);
    expect(element.count).toBeGreaterThan(0);
    input.dispose();
    expect(doc.count).toBe(0);
    expect(element.count).toBe(0);
  });
});
