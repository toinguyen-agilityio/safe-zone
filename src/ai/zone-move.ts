import { config } from '../config';
import type { Rng } from '../core/rng';
import type { BoxSource } from '../physics/collision';
import type { Box } from '../physics/spatial-grid';
import type { ZoneCircle, ZoneSystem } from '../systems/zone-system';
import { pickDestination, type Destination } from './zone-destination';

/** What bots need to know about the zone. A plain object so tests can fake it. */
export interface ZoneInfo {
  /** The phase, 1 to 5. */
  phase: number;
  /** The warning time has started: the water is about to rise or already is. */
  warning: boolean;
  /** The circle the zone shrinks to, or null once the last shrink is over. */
  next: ZoneCircle | null;
}

/** The warning starts this many seconds before a shrink, and lasts through it. */
export function zoneInfo(zone: ZoneSystem): ZoneInfo {
  const warning =
    zone.stage === 'shrink' ||
    (zone.stage === 'wait' && zone.stageLeft <= config.bots.zoneWarningSeconds);
  return { phase: zone.phase, warning, next: zone.next };
}

export function insideCircle(p: { x: number; z: number }, circle: ZoneCircle): boolean {
  return Math.hypot(p.x - circle.center.x, p.z - circle.center.z) <= circle.radius;
}

/**
 * Decides where one bot should walk to stay dry. When the warning starts, a bot outside the next
 * zone picks a point inside it and keeps heading there; a bot already inside stays where it is.
 * A new phase gets a new pick.
 */
export class ZoneMover {
  private destination: Destination | null = null;
  private pickedFor = 0;

  constructor(private readonly rng: Rng) {}

  /** Forget the current destination so the next update picks a different one. */
  reroll(): void {
    this.destination = null;
  }

  /** The point to walk to now, or null when the bot has nowhere it must go. */
  update(
    bot: { x: number; z: number },
    zone: ZoneInfo | null,
    world: BoxSource | readonly Box[],
  ): Destination | null {
    if (!zone || !zone.warning || !zone.next || insideCircle(bot, zone.next)) {
      this.destination = null;
      return null;
    }
    if (!this.destination || this.pickedFor !== zone.phase) {
      this.destination = pickDestination(zone.next, world, this.rng);
      this.pickedFor = zone.phase;
    }
    return this.destination;
  }
}
