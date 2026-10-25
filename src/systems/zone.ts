import { config } from '../config';

export interface ZonePoint {
  x: number;
  z: number;
}

export type ZoneStage = 'wait' | 'shrink' | 'done';

export interface ZoneState {
  /** The phase in progress, 1 to 5; stays 5 once the last shrink is over. */
  phase: number;
  stage: ZoneStage;
  /** Radius of the dry zone right now. */
  radius: number;
  center: ZonePoint;
  /** Seconds left in this stage; 0 when done. */
  stageLeft: number;
}

const { radii, waitSeconds, shrinkSeconds, startRadius } = config.zone;
const PHASES = radii.length;
const MAP_CENTER: ZonePoint = { x: 0, z: 0 };

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Where the zone is after `elapsed` seconds. Each phase waits with the zone as it is, then shrinks
 * in a straight line to the phase radius and its new center. `centers` holds one center per phase;
 * by default every phase stays on the middle of the map.
 */
export function zoneAt(elapsed: number, centers: readonly ZonePoint[] = []): ZoneState {
  const centerOf = (phase: number): ZonePoint => centers[phase] ?? centers.at(-1) ?? MAP_CENTER;

  let from: { radius: number; center: ZonePoint } = { radius: startRadius, center: MAP_CENTER };
  let t = Math.max(0, elapsed);
  for (let phase = 0; phase < PHASES; phase++) {
    const wait = waitSeconds[phase]!;
    if (t < wait) {
      return { phase: phase + 1, stage: 'wait', ...from, stageLeft: wait - t };
    }
    t -= wait;

    const shrink = shrinkSeconds[phase]!;
    const to = { radius: radii[phase]!, center: centerOf(phase) };
    if (t < shrink) {
      const k = t / shrink;
      return {
        phase: phase + 1,
        stage: 'shrink',
        radius: lerp(from.radius, to.radius, k),
        center: { x: lerp(from.center.x, to.center.x, k), z: lerp(from.center.z, to.center.z, k) },
        stageLeft: shrink - t,
      };
    }
    t -= shrink;
    from = to;
  }
  return { phase: PHASES, stage: 'done', ...from, stageLeft: 0 };
}

/** Total seconds from the start of the match to the end of the last shrink. */
export function zoneDuration(): number {
  return waitSeconds.reduce((a, b) => a + b, 0) + shrinkSeconds.reduce((a, b) => a + b, 0);
}

/** The flood zone, advanced by simulated time. */
export class Zone {
  private elapsed = 0;

  constructor(private readonly centers: readonly ZonePoint[] = []) {}

  update(dt: number): void {
    this.elapsed += dt;
  }

  get state(): ZoneState {
    return zoneAt(this.elapsed, this.centers);
  }

  get time(): number {
    return this.elapsed;
  }
}
