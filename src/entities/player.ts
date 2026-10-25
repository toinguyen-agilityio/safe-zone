import { config } from '../config';
import type { MouseDelta } from '../core/input';
import { applyMouseLook } from '../systems/look';
import { walkVelocity, type MoveKeys } from '../systems/movement';

export interface Player {
  /** Position of the eyes. */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export interface PlayerInput {
  keys: MoveKeys;
  mouseDelta: MouseDelta;
  /** True while the mouse is captured. Without it the player ignores keys and mouse. */
  locked: boolean;
}

export function createPlayer(): Player {
  return {
    x: config.player.spawn.x,
    y: config.player.eyeHeight,
    z: config.player.spawn.z,
    yaw: 0,
    pitch: 0,
  };
}

/** Turn the view with the mouse and walk with the keys, but only while the mouse is captured. */
export function updatePlayer(player: Player, input: PlayerInput, dt: number): void {
  if (!input.locked) return;
  const look = applyMouseLook(player, input.mouseDelta.x, input.mouseDelta.y);
  player.yaw = look.yaw;
  player.pitch = look.pitch;

  const velocity = walkVelocity(input.keys, player.yaw);
  player.x += velocity.x * dt;
  player.z += velocity.z * dt;
}
