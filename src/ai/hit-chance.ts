import { config } from '../config';
import { clamp } from '../core/math';

export interface HitChanceInput {
  /** Distance from the bot to the target. */
  distance: number;
  /** The target is sprinting. */
  running: boolean;
  /** The target is jumping or falling. */
  airborne: boolean;
}

/**
 * The chance, from 0 to 1, that a bot's shot hits. It is highest up close and falls in a straight
 * line to its lowest at long range, and a target that sprints or jumps is harder to hit.
 */
export function hitChance({ distance, running, airborne }: HitChanceInput): number {
  const { close, far, nearRange, farRange, runningMultiplier, airborneMultiplier } =
    config.bots.hitChance;
  const t = clamp((distance - nearRange) / (farRange - nearRange), 0, 1);
  const base = close + (far - close) * t;
  // A jump is the harder target; it is not made worse by also running.
  const multiplier = airborne ? airborneMultiplier : running ? runningMultiplier : 1;
  return clamp(base * multiplier, 0, 1);
}
