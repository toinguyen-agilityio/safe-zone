import { config } from '../config';
import { clampToMap } from '../physics/bounds';
import { walkVelocity, type MoveKeys } from './movement';

export interface ParachuteState {
  x: number;
  z: number;
  /** Height of the feet above the ground plane. */
  feetY: number;
  /** True once the feet touched the ground; the drop is over. */
  landed: boolean;
}

/** Start a drop at the given spot, high above the map. */
export function startParachute(x: number, z: number): ParachuteState {
  return { x, z, feetY: config.player.parachuteStartHeight, landed: false };
}

/**
 * One step of the descent: steady fall (faster while `fastFall` is held), WASD drift relative to
 * the view direction, kept inside the map, and touchdown on the ground height under the player.
 * A player who has landed does not move any more.
 */
export function stepParachute(
  state: ParachuteState,
  keys: MoveKeys,
  yaw: number,
  fastFall: boolean,
  groundY: number,
  dt: number,
): ParachuteState {
  if (state.landed) return state;
  const { fallSpeed, fastFallSpeed, driftSpeed } = config.player.parachute;

  const drift = walkVelocity({ ...keys, sprint: false }, yaw, driftSpeed);
  const moved = clampToMap(
    { x: state.x + drift.x * dt, z: state.z + drift.z * dt },
    config.player.radius,
  );

  const feetY = state.feetY - (fastFall ? fastFallSpeed : fallSpeed) * dt;
  if (feetY <= groundY) return { x: moved.x, z: moved.z, feetY: groundY, landed: true };
  return { x: moved.x, z: moved.z, feetY, landed: false };
}
