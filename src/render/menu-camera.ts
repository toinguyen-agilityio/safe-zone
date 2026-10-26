import type { PerspectiveCamera } from 'three';
import { riverCenterX } from '../world/layout';

/** The camera circles above the river around this point. */
const CENTER_Z = 0;
/** Distance from the middle of the circle, height above the ground and seconds for one lap. */
export const ORBIT = { radius: 150, height: 95, lapSeconds: 70 };
/** How steeply it looks down at the river, in radians. */
const PITCH = -0.55;

export interface MenuPose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

/** Where the menu camera is after `seconds`: a smooth circle over the Han river, always looking at its middle. */
export function menuCameraPose(seconds: number): MenuPose {
  const centerX = riverCenterX(CENTER_Z);
  const angle = (seconds / ORBIT.lapSeconds) * Math.PI * 2;
  const x = centerX + Math.cos(angle) * ORBIT.radius;
  const z = CENTER_Z + Math.sin(angle) * ORBIT.radius;
  // Yaw 0 looks toward -z, a positive yaw turns left; this faces the middle of the circle.
  const yaw = Math.atan2(-(centerX - x), -(CENTER_Z - z));
  return { x, y: ORBIT.height, z, yaw, pitch: PITCH };
}

/** Put the camera at a menu pose. */
export function applyMenuPose(camera: PerspectiveCamera, pose: MenuPose): void {
  camera.position.set(pose.x, pose.y, pose.z);
  camera.rotation.order = 'YXZ';
  camera.rotation.set(pose.pitch, pose.yaw, 0);
}
