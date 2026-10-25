import type { PerspectiveCamera } from 'three';
import type { Player } from '../entities/player';

/** Put the camera at the player's eyes, looking where the player looks. */
export function applyPlayerToCamera(camera: PerspectiveCamera, player: Player): void {
  camera.position.set(player.x, player.y, player.z);
  // Yaw turns around the world's up axis first, then pitch tilts around the camera's own x axis.
  camera.rotation.order = 'YXZ';
  camera.rotation.set(player.pitch, player.yaw, 0);
}
