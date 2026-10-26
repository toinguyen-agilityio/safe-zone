import { config } from '../config';
import type { EventBus } from '../core/events';
import { announcement } from '../ui/messages-vi';
import { Zone, type ZonePoint, type ZoneStage } from './zone';
import { chooseZoneCenters } from './zone-center';

export interface ZoneCircle {
  center: ZonePoint;
  radius: number;
}

export interface ZoneEvent {
  /** The phase, 1 to 5. */
  phase: number;
  /** The dry zone right now. */
  current: ZoneCircle;
  /** The circle this phase shrinks to. */
  next: ZoneCircle;
}

declare module '../core/events' {
  interface EventMap {
    /** A phase begins: the zone waits at its current size. */
    'zone:phase': ZoneEvent;
    /** The wait is over and the zone starts shrinking toward `next`. */
    'zone:shrink': ZoneEvent;
  }
}

/**
 * The flood zone of a match. It is advanced by the game update, which does not run while paused,
 * so it only moves while the match runs. It says when a phase starts and when a shrink starts.
 */
export class ZoneSystem {
  private readonly zone: Zone;
  private readonly centers: ZonePoint[];
  private lastPhase = 0;
  private lastStage: ZoneStage | null = null;

  constructor(
    private readonly events: EventBus,
    seed: number = config.world.defaultSeed,
  ) {
    this.centers = chooseZoneCenters(seed);
    this.zone = new Zone(this.centers);
    this.announce();
  }

  /** The dry zone right now. */
  get current(): ZoneCircle {
    const { center, radius } = this.zone.state;
    return { center, radius };
  }

  /** The circle the zone is heading for, or null once the last shrink is over. */
  get next(): ZoneCircle | null {
    const { phase, stage } = this.zone.state;
    if (stage === 'done') return null;
    return this.target(phase);
  }

  get phase(): number {
    return this.zone.state.phase;
  }

  get stage(): ZoneStage {
    return this.zone.state.stage;
  }

  /** Seconds left in the current wait or shrink. */
  get stageLeft(): number {
    return this.zone.state.stageLeft;
  }

  /** Is the point inside the dry zone? */
  isDry(x: number, z: number): boolean {
    const { center, radius } = this.current;
    return Math.hypot(x - center.x, z - center.z) <= radius;
  }

  update(dt: number): void {
    this.zone.update(dt);
    this.announce();
  }

  private target(phase: number): ZoneCircle {
    return { center: this.centers[phase - 1]!, radius: config.zone.radii[phase - 1]! };
  }

  /** Emit an event for each phase and shrink that began since the last call. */
  private announce(): void {
    const { phase, stage } = this.zone.state;
    if (stage === 'done') {
      this.lastPhase = phase;
      this.lastStage = stage;
      return;
    }
    const event = (): ZoneEvent => ({ phase, current: this.current, next: this.target(phase) });
    if (phase !== this.lastPhase) {
      this.lastPhase = phase;
      this.lastStage = 'wait';
      this.events.emit('zone:phase', event());
      this.events.emit('announce', announcement('newDryZone'));
    }
    if (stage === 'shrink' && this.lastStage !== 'shrink') {
      this.lastStage = 'shrink';
      this.events.emit('zone:shrink', event());
      this.events.emit('announce', announcement('waterRising'));
    }
  }
}
