import { config } from '../config';

export interface VerticalState {
  /** Height of the feet. */
  y: number;
  /** Upward speed; negative while falling. */
  vy: number;
}

const GROUND_TOLERANCE = 1e-6;

/** True when the feet rest on the ground and are not moving up. */
export function isGrounded(state: VerticalState, groundY: number): boolean {
  return state.y <= groundY + GROUND_TOLERANCE && state.vy <= 0;
}

/**
 * One step of gravity and jumping. A jump only starts from the ground, so pressing the key in
 * the air does nothing. The feet land on the ground height under them, which may be higher (a
 * deck) or lower (the river bed) than where they took off.
 */
export function stepVertical(
  state: VerticalState,
  wantsJump: boolean,
  groundY: number,
  dt: number,
  gravity: number = config.player.gravity,
  jumpSpeed: number = config.player.jumpSpeed,
): VerticalState {
  let vy = state.vy;
  if (wantsJump && isGrounded(state, groundY)) vy = jumpSpeed;

  vy -= gravity * dt;
  const y = state.y + vy * dt;
  if (y <= groundY) return { y: groundY, vy: 0 };
  return { y, vy };
}
