import { config } from '../config';
import type { Health } from '../entities/health';

const { drainPerSecond } = config.zone;

/** Health lost each second outside the dry zone in a phase (1 to 5); phases past the range clamp. */
export function zoneDps(phase: number): number {
  const index = Math.min(Math.max(Math.round(phase), 1), drainPerSecond.length) - 1;
  return drainPerSecond[index]!;
}

/** The damage of `dt` seconds spent in the flood: nothing inside the dry zone. */
export function zoneDamage(phase: number, dt: number, outside: boolean): number {
  return outside && dt > 0 ? zoneDps(phase) * dt : 0;
}

/**
 * Take the flood's damage off someone's health. It is not a gun hit, so armor does not help. Returns
 * what happened, or null when nothing was taken.
 */
export function applyZoneDamage(
  health: Health,
  phase: number,
  dt: number,
  outside: boolean,
): ReturnType<Health['damage']> | null {
  const amount = zoneDamage(phase, dt, outside);
  return amount > 0 ? health.damage(amount, 'flood') : null;
}
