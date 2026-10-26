/** Yaw looking from (fromX, fromZ) toward (toX, toZ); yaw 0 looks toward -z like the player's. */
export function yawToward(fromX: number, fromZ: number, toX: number, toZ: number): number {
  return Math.atan2(-(toX - fromX), -(toZ - fromZ));
}
