import type { EventBus } from '../core/events';
import type { Health } from '../entities/health';
import type { Vec3 } from './fire-control';
import type { KillLog } from './kill-log';

/** Something that can be shot: it has health and says what to do when it dies. */
export interface Damageable {
  id: string;
  health: Health;
  /** Called once, on the hit that kills. */
  onKilled?: () => void;
}

/** A hit that took something off an entity. */
export interface DamageEvent {
  target: string;
  /** Taken off health, after armor. */
  health: number;
  /** Taken off armor. */
  armor: number;
  /** Who dealt it: the shooter's id, or null for the flood. */
  by: string | null;
  /** Where the shot came from, for the damage indicator; null when unknown. */
  from: Vec3 | null;
}

declare module '../core/events' {
  interface EventMap {
    damage: DamageEvent;
  }
}

export interface DamageWorld {
  /** Find who was hit by id. */
  entity: (id: string) => Damageable | undefined;
  kills: KillLog;
  /** Seconds of match time, written on each kill. */
  now: () => number;
}

/** Turn every `hit` event into damage with armor, a `damage` event and, when lethal, a kill. */
export function connectDamage(events: EventBus, world: DamageWorld): () => void {
  return events.on('hit', (hit) => {
    const target = world.entity(hit.target);
    if (!target || target.health.dead) return;

    const result = target.health.damage(hit.damage, 'gun');
    events.emit('damage', {
      target: target.id,
      health: result.health,
      armor: result.armor,
      by: hit.shooter,
      from: hit.origin,
    });
    if (!result.killed) return;
    world.kills.recordKill({
      killer: hit.shooter,
      victim: target.id,
      cause: 'shot',
      time: world.now(),
    });
    target.onKilled?.();
  });
}
