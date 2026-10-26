import type { PerspectiveCamera } from 'three';
import { config } from '../config';
import type { Player } from '../entities/player';

/** The normal vertical field of view, in degrees. */
export const HIP_FOV_DEGREES = 60;

/** Put the camera at the player's eyes, looking where the player looks. */
export function applyPlayerToCamera(camera: PerspectiveCamera, player: Player): void {
  camera.position.set(player.x, player.y, player.z);
  // Yaw turns around the world's up axis first, then pitch tilts around the camera's own x axis.
  camera.rotation.order = 'YXZ';
  camera.rotation.set(player.pitch, player.yaw, 0);
}

/** Narrow the view as the player aims: 0 is the normal view, 1 fully aimed. */
export function applyAimToCamera(camera: PerspectiveCamera, aim: number): void {
  const fov = HIP_FOV_DEGREES + (config.combat.aim.fovDegrees - HIP_FOV_DEGREES) * aim;
  if (camera.fov === fov) return;
  camera.fov = fov;
  camera.updateProjectionMatrix();
}
