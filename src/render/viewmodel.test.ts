import { Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { applyPlayerToCamera } from './first-person-camera';
import { createPlayer } from '../entities/player';
import { attachViewmodel, buildRifle } from './viewmodel';

describe('viewmodel', () => {
  it('is a child of the camera', () => {
    const camera = new PerspectiveCamera();
    const rifle = attachViewmodel(camera);
    expect(rifle.parent).toBe(camera);
  });

  it('is not lit by the world: every part uses a basic material', () => {
    const meshes: Mesh[] = [];
    buildRifle().traverse((o) => {
      if (o instanceof Mesh) meshes.push(o);
    });
    expect(meshes.length).toBeGreaterThan(3);
    for (const mesh of meshes) expect(mesh.material).toBeInstanceOf(MeshBasicMaterial);
  });

  it('sits in the lower right, in front of the lens', () => {
    const camera = new PerspectiveCamera();
    const rifle = attachViewmodel(camera);
    expect(rifle.position.x).toBeGreaterThan(0);
    expect(rifle.position.y).toBeLessThan(0);
    expect(rifle.position.z).toBeLessThan(0);
  });

  it('follows the camera when the player turns and moves', () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    scene.add(camera);
    const rifle = attachViewmodel(camera);
    const player = createPlayer();
    player.x = 10;
    player.z = -5;
    player.yaw = Math.PI / 2;
    applyPlayerToCamera(camera, player);
    scene.updateMatrixWorld(true);
    const world = rifle.getWorldPosition(new Vector3());
    expect(world.distanceTo(camera.position)).toBeLessThan(1);
    expect(world.distanceTo(camera.position)).toBeGreaterThan(0.2);
  });
});
