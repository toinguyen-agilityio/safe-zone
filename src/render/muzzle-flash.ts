import { AdditiveBlending, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import type { Group } from 'three';

/** Seconds the flash stays lit. */
export const FLASH_SECONDS = 0.05;

/** A small star of light at the rifle's muzzle, lit for an instant on each shot. */
export class MuzzleFlash {
  readonly mesh: Mesh;
  private left = 0;

  constructor(rifle: Group) {
    const material = new MeshBasicMaterial({
      color: 0xffd36b,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    });
    this.mesh = new Mesh(new PlaneGeometry(0.16, 0.16), material);
    this.mesh.name = 'muzzle-flash';
    this.mesh.position.set(0, 0.01, -0.62);
    this.mesh.visible = false;
    rifle.add(this.mesh);
  }

  get lit(): boolean {
    return this.left > 0;
  }

  /** Light the flash, with a different turn each time so it flickers. */
  flash(): void {
    this.left = FLASH_SECONDS;
    this.mesh.rotation.z = Math.random() * Math.PI;
    this.mesh.visible = true;
    (this.mesh.material as MeshBasicMaterial).opacity = 1;
  }

  update(dt: number): void {
    if (this.left <= 0) return;
    this.left = Math.max(0, this.left - dt);
    this.mesh.visible = this.left > 0;
    (this.mesh.material as MeshBasicMaterial).opacity = this.left / FLASH_SECONDS;
  }
}
