import { config } from '../config';
import { riverCenterX } from '../world/layout';
import { walkVelocity, type MoveKeys, type Velocity } from './movement';

const { world } = config;

/**
 * True when the feet are in the river and below the water surface. That includes standing on the
 * river bed and swimming under a bridge deck, but not standing on a deck or ramp over the water, or
 * jumping across with the feet above it.
 */
export function isSwimming(x: number, z: number, feetY: number): boolean {
  const inRiver = Math.abs(x - riverCenterX(z)) <= world.river.width / 2;
  return inRiver && feetY < world.river.waterLevel;
}

/** Walking velocity on land; in the water the slow swim speed, and Shift gives nothing extra. */
export function moveVelocity(keys: MoveKeys, yaw: number, swimming: boolean): Velocity {
  if (!swimming) return walkVelocity(keys, yaw);
  return walkVelocity({ ...keys, sprint: false }, yaw, config.player.swimSpeed);
}
