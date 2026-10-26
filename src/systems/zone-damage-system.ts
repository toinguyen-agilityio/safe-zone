import type { EventBus } from '../core/events';
import type { Health } from '../entities/health';
import { applyZoneDamage } from './zone-damage';
import type { KillLog } from './kill-log';

/** Someone who can be hurt by the flood: the player or a bot. */
export interface ZoneVictim {
  id: string;
  x: number;
  z: number;
  health: Health;
  /** Not in the match yet, for example still under the parachute. */
  skip?: boolean;
  /** Called once, when the flood kills them. */
  onKilled?: () => void;
}

/** The parts of the zone this system needs. `ZoneSystem` fits. */
export interface FloodZone {
  phase: number;
  isDry: (x: number, z: number) => boolean;
}

export interface ZoneDamageWorld {
  zone: FloodZone;
  /** Everyone who may be standing in the flood. */
  victims: () => Iterable<ZoneVictim>;
  kills: KillLog;
  /** Seconds of match time, written on each kill. */
  now: () => number;
  events: EventBus;
}

/**
 * Drains the health of everyone outside the dry zone, the player and the bots alike. The flood
 * ignores armor. A death from it is recorded as a `flood` kill with nobody credited.
 */
export class ZoneDamageSystem {
  constructor(private readonly world: ZoneDamageWorld) {}

  update(dt: number): void {
    const { zone, kills, events } = this.world;
    for (const victim of this.world.victims()) {
      if (victim.skip || victim.health.dead) continue;
      const result = applyZoneDamage(
        victim.health,
        zone.phase,
        dt,
        !zone.isDry(victim.x, victim.z),
      );
      if (!result) continue;

      events.emit('damage', {
        target: victim.id,
        health: result.health,
        armor: result.armor,
        by: null,
        from: null,
      });
      if (!result.killed) continue;
      kills.recordKill({ killer: null, victim: victim.id, cause: 'flood', time: this.world.now() });
      victim.onKilled?.();
    }
  }
}
