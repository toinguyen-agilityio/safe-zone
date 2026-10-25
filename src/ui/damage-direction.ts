/** The part of the player the angle needs: where the eyes are and which way they look. */
export interface ViewPose {
  x: number;
  z: number;
  yaw: number;
}

/**
 * The direction a shot came from relative to where the player looks, in radians:
 * 0 is straight ahead, a quarter turn (π/2) is to the right, π is behind, -π/2 to the left.
 * Yaw 0 looks toward -z, the same as the first-person camera.
 */
export function damageDirection(pose: ViewPose, from: { x: number; z: number }): number {
  const dx = from.x - pose.x;
  const dz = from.z - pose.z;
  const ahead = -Math.sin(pose.yaw) * dx - Math.cos(pose.yaw) * dz;
  const right = Math.cos(pose.yaw) * dx - Math.sin(pose.yaw) * dz;
  return Math.atan2(right, ahead);
}
