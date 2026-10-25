import { config } from '../config';
import { clamp } from '../core/math';
import type { Player } from '../entities/player';

export type GroundHeight = (x: number, z: number, currentY: number) => number;

/**
 * Move the player's eyes toward the ground under the feet. The feet climb a ramp at a limited
 * speed and drop into the river at a limited speed, so the view never jumps.
 */
export function updatePlayerHeight(player: Player, groundHeight: GroundHeight, dt: number): void {
  const { eyeHeight, climbSpeed, fallSpeed } = config.player;
  const feet = player.y - eyeHeight;
  const target = groundHeight(player.x, player.z, feet);
  player.y += clamp(target - feet, -fallSpeed * dt, climbSpeed * dt);
}
