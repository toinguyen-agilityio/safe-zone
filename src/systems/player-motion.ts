import { config } from '../config';
import { updatePlayer, type Player, type PlayerInput } from '../entities/player';
import { collidePlayer, createCollisionWorld } from './player-collision';
import { createGroundHeight } from '../physics/ground';
import type { BoxSource } from '../physics/collision';
import type { Box } from '../physics/spatial-grid';
import type { Layout } from '../world/types';
import type { GroundHeight } from './player-height';
import { isSwimming } from './swim';
import { isGrounded, stepVertical } from './vertical';

/** What the player moves through: the things that block it and the height of the ground. */
export interface MotionWorld {
  collision: BoxSource | readonly Box[];
  groundHeight: GroundHeight;
}

export function createMotionWorld(layout: Layout): MotionWorld {
  return { collision: createCollisionWorld(layout), groundHeight: createGroundHeight(layout) };
}

/** Feet within this distance of the ground, and not moving up, count as on the ground. */
const AIRBORNE_TOLERANCE = 0.05;

/**
 * One update of the player: look, walk, sprint and swim on the ground plane, then blocked by
 * houses and the map edge, then jump, gravity and the height of the ground. Also sets the state
 * flags (`swimming`, `sprinting`, `airborne`) that later systems read.
 */
export function updatePlayerMotion(
  player: Player,
  input: PlayerInput,
  world: MotionWorld,
  dt: number,
): void {
  const { eyeHeight, climbSpeed } = config.player;
  const feetBefore = player.y - eyeHeight;
  player.swimming = isSwimming(player.x, player.z, feetBefore);

  const previous = { x: player.x, z: player.z };
  updatePlayer(player, input, dt);
  collidePlayer(player, previous, world.collision);

  const moving =
    input.locked && (input.keys.forward || input.keys.back || input.keys.left || input.keys.right);
  player.sprinting = Boolean(input.locked && input.keys.sprint && moving && !player.swimming);

  const feet = player.y - eyeHeight;
  const ground = world.groundHeight(player.x, player.z, feet);
  if (feet < ground - AIRBORNE_TOLERANCE) {
    // Below the ground it is walking up: a ramp or the bank. Climb smoothly, never snap.
    player.y += Math.min(ground - feet, climbSpeed * dt);
    player.vy = 0;
  } else {
    // Swimmers cannot jump off the river bed.
    const wantsJump = Boolean(input.locked && input.jump && !player.swimming);
    const next = stepVertical({ y: feet, vy: player.vy }, wantsJump, ground, dt);
    player.y = next.y + eyeHeight;
    player.vy = next.vy;
  }

  const feetAfter = player.y - eyeHeight;
  const groundAfter = world.groundHeight(player.x, player.z, feetAfter);
  player.airborne = !isGrounded({ y: feetAfter, vy: player.vy }, groundAfter + AIRBORNE_TOLERANCE);
}
