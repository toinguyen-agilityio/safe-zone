import { config } from '../config';

/** What the player is doing, as far as accuracy goes. */
export interface SpreadState {
  /** A movement key is held and the player is on the ground. */
  moving: boolean;
  /** The feet are off the ground, jumping or falling. */
  airborne: boolean;
  /** Aiming down the sights. */
  aiming: boolean;
}

const DEGREES = Math.PI / 180;

/**
 * How far a bullet can stray from where the rifle points, as an angle in radians. Standing still
 * is the tightest, moving is looser, being in the air is the loosest; aiming down the sights
 * shrinks any of them.
 */
export function currentSpread(state: SpreadState): number {
  const { standingDegrees, movingDegrees, airborneDegrees, aimMultiplier } = config.combat.spread;
  const base = state.airborne ? airborneDegrees : state.moving ? movingDegrees : standingDegrees;
  return base * (state.aiming ? aimMultiplier : 1) * DEGREES;
}
