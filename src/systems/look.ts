import { config } from '../config';
import { clamp } from '../core/math';

export interface LookState {
  /** Turn left and right in radians, wrapped to (-PI, PI]. */
  yaw: number;
  /** Look up (positive) and down in radians, clamped to the pitch limit. */
  pitch: number;
}

const TWO_PI = Math.PI * 2;

export function pitchLimit(): number {
  return (config.player.pitchLimitDegrees * Math.PI) / 180;
}

/** Wrap an angle to (-PI, PI]. */
export function wrapAngle(angle: number): number {
  const wrapped = angle - TWO_PI * Math.round(angle / TWO_PI);
  return wrapped <= -Math.PI ? wrapped + TWO_PI : wrapped;
}

/** Turn mouse movement in pixels into a new yaw and pitch. Moving right turns right. */
export function applyMouseLook(
  state: LookState,
  deltaX: number,
  deltaY: number,
  sensitivity: number = config.player.lookSensitivity,
): LookState {
  const limit = pitchLimit();
  return {
    yaw: wrapAngle(state.yaw - deltaX * sensitivity),
    pitch: clamp(state.pitch - deltaY * sensitivity, -limit, limit),
  };
}
