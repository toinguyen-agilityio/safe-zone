import type { EventBus } from '../core/events';

export type KillCause = 'shot' | 'flood';

export interface KillRecord {
  /** Who fired the shot; null when the flood did it. */
  killer: string | null;
  victim: string;
  cause: KillCause;
  /** Seconds of match time when it happened. */
  time: number;
}

declare module '../core/events' {
  interface EventMap {
    kill: KillRecord;
  }
}

/** Who killed whom, in the order it happened. */
export class KillLog {
  private readonly records: KillRecord[] = [];

  constructor(private readonly events?: EventBus) {}

  /** Store a kill and tell the rest of the game about it. */
  recordKill(record: KillRecord): KillRecord {
    const stored = { ...record };
    this.records.push(stored);
    this.events?.emit('kill', stored);
    return stored;
  }

  get all(): readonly KillRecord[] {
    return this.records;
  }

  /** How many players this entity has shot dead. */
  killsBy(killer: string): number {
    return this.records.filter((r) => r.killer === killer).length;
  }

  /** The kill that ended this victim, if they are dead. */
  deathOf(victim: string): KillRecord | undefined {
    return this.records.find((r) => r.victim === victim);
  }
}
