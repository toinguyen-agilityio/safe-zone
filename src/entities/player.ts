import { config } from '../config';
import { createRng } from '../core/rng';
import type { MouseDelta } from '../core/input';
import { applyMouseLook } from '../systems/look';
import type { MoveKeys } from '../systems/movement';
import { moveVelocity } from '../systems/swim';

export interface Player {
  /** Position of the eyes. */
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  /** Upward speed of the feet; negative while falling. */
  vy: number;
  /** In the river with the feet below the water. */
  swimming: boolean;
  /** Moving fast on foot: Shift is held, a direction key is down, and not swimming. */
  sprinting: boolean;
  /** The feet are off the ground, jumping or falling. */
  airborne: boolean;
  /** Still under the parachute at the start of the match; walking control starts on touchdown. */
  parachuting: boolean;
}

export interface PlayerInput {
  keys: MoveKeys;
  mouseDelta: MouseDelta;
  /** True while the mouse is captured. Without it the player ignores keys and mouse. */
  locked: boolean;
  /** Space is held. Optional so callers that do not jump can leave it out. */
  jump?: boolean;
}

export function createPlayer(): Player {
  return {
    x: config.player.spawn.x,
    y: config.player.eyeHeight,
    z: config.player.spawn.z,
    yaw: 0,
    pitch: 0,
    vy: 0,
    swimming: false,
    sprinting: false,
    airborne: false,
    parachuting: false,
  };
}

/** Turn the view with the mouse and walk with the keys, but only while the mouse is captured. */
export function updatePlayer(player: Player, input: PlayerInput, dt: number): void {
  if (!input.locked) return;
  const look = applyMouseLook(player, input.mouseDelta.x, input.mouseDelta.y);
  player.yaw = look.yaw;
  player.pitch = look.pitch;

  const velocity = moveVelocity(input.keys, player.yaw, player.swimming);
  player.x += velocity.x * dt;
  player.z += velocity.z * dt;
}

/** Where a match starts: a seeded spot over the map, high up under the parachute. */
export function createParachutingPlayer(seed: number): Player {
  const rng = createRng(seed ^ 0x5eed);
  const span = config.world.mapSize - 40;
  const player = createPlayer();
  player.x = (rng.float() - 0.5) * span;
  player.z = (rng.float() - 0.5) * span;
  player.y = config.player.parachuteStartHeight + config.player.eyeHeight;
  // Face the middle of the map and look down at the city.
  player.yaw = Math.atan2(player.x, player.z);
  player.pitch = -0.6;
  player.parachuting = true;
  player.airborne = true;
  return player;
}
