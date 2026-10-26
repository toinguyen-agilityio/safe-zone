import { config } from '../config';
import type { DamageEvent } from './damage-system';
import type { KillCause, KillRecord } from './kill-log';

const PLAYER_ID = 'player';

/** Everyone in the match at the start: the player and the bots. */
export const PLAYERS_AT_START = config.bots.count + 1;

export interface MatchSummary {
  /** Players still alive when the player died, counting the player: 1 for the winner. */
  rank: number;
  /** Players the player shot dead. */
  kills: number;
  /** Health and armor taken from others by the player's shots. */
  damageDealt: number;
  /** Seconds the player lasted. */
  survivalSeconds: number;
  /** The player was the last one alive. */
  won: boolean;
  /** How the player died, or null for the winner. */
  cause: KillCause | null;
}

/**
 * The player's results for the match. It follows the kills and the damage as they happen and says
 * when the match is over: the player has died, or is the last one alive.
 */
export class MatchResults {
  private readonly dead = new Set<string>();
  private kills = 0;
  private damageDealt = 0;
  private summary: MatchSummary | null = null;

  constructor(private readonly total: number = PLAYERS_AT_START) {}

  get alive(): number {
    return Math.max(0, this.total - this.dead.size);
  }

  /** True once the match has been decided. */
  get finished(): boolean {
    return this.summary !== null;
  }

  /** The results, or null while the match goes on. */
  get result(): MatchSummary | null {
    return this.summary;
  }

  /** Damage the player's shots did. Other people's damage, and the flood, does not count. */
  onDamage(damage: DamageEvent): void {
    if (this.summary || damage.by !== PLAYER_ID || damage.target === PLAYER_ID) return;
    this.damageDealt += damage.health + damage.armor;
  }

  /** A kill, at `seconds` into the match. */
  onKill(kill: KillRecord, seconds: number): void {
    if (this.summary || this.dead.has(kill.victim)) return;

    // The rank is how many were alive just before this death, the player included.
    const aliveBefore = this.alive;
    this.dead.add(kill.victim);
    if (kill.killer === PLAYER_ID && kill.victim !== PLAYER_ID) this.kills++;

    if (kill.victim === PLAYER_ID) {
      this.finish(aliveBefore, seconds, false, kill.cause);
    } else if (this.alive === 1 && !this.dead.has(PLAYER_ID)) {
      this.finish(1, seconds, true, null);
    }
  }

  private finish(rank: number, seconds: number, won: boolean, cause: KillCause | null): void {
    this.summary = {
      rank,
      kills: this.kills,
      damageDealt: Math.round(this.damageDealt),
      survivalSeconds: seconds,
      won,
      cause,
    };
  }
}
