import { config } from '../config';
import { hasLineOfSight } from '../physics/los';
import type { BoxQuery, RayBox } from '../physics/raycast';

/** Anyone who can see or be seen: the player or a bot, standing at (x, z) with feet at `feetY`. */
export interface Combatant {
  id: string;
  x: number;
  z: number;
  feetY: number;
  /** Still under the parachute: not in the fight yet. */
  parachuting?: boolean;
  /** Out of health. */
  dead?: boolean;
}

/** Where a bot looks from, and where it aims at: the eyes of the watcher, the chest of the target. */
const CHEST_HEIGHT = 1.2;

/**
 * The nearest enemy that `self` has a clear line to, or null when it sees nobody. Everyone but
 * itself is an enemy, the player and the other bots alike. The dead and the ones still under a
 * parachute do not count, and an enemy behind a house is ignored even when it is the closest.
 */
export function pickTarget<T extends Combatant>(
  self: Combatant,
  candidates: Iterable<T>,
  obstacles: BoxQuery<RayBox> | readonly RayBox[],
): T | null {
  const from = { x: self.x, y: self.feetY + config.player.eyeHeight, z: self.z };
  let best: T | null = null;
  let bestDistance = Infinity;
  for (const other of candidates) {
    if (other.id === self.id || other.dead || other.parachuting) continue;
    const distance = Math.hypot(other.x - self.x, other.z - self.z);
    if (distance >= bestDistance) continue;
    const to = { x: other.x, y: other.feetY + CHEST_HEIGHT, z: other.z };
    if (!hasLineOfSight(from, to, obstacles)) continue;
    best = other;
    bestDistance = distance;
  }
  return best;
}
