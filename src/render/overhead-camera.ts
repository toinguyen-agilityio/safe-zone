import type { PerspectiveCamera } from 'three';

/** Looks straight down at the map center. Used until the first-person player exists. */
export function placeOverheadCamera(camera: PerspectiveCamera, mapSize: number): void {
  camera.position.set(0, mapSize * 0.95, mapSize * 0.02);
  camera.lookAt(0, 0, 0);
}
