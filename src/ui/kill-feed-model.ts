import { config } from '../config';
import type { KillRecord } from '../systems/kill-log';

/** What the feed says when the flood did it. */
export const FLOOD_NAME = 'Nước lũ';

export interface FeedLine {
  killer: string;
  victim: string;
  cause: KillRecord['cause'];
  /** The player was the killer or the victim, to stand out in the feed. */
  involvesPlayer: boolean;
}

/** The latest kills as lines "killer, victim", oldest first, never more than `max`. */
export class KillFeedModel {
  private readonly items: FeedLine[] = [];

  constructor(
    private readonly nameOf: (id: string) => string = (id) => id,
    private readonly max: number = config.ui.killFeedMax,
  ) {}

  add(kill: KillRecord): FeedLine {
    const line: FeedLine = {
      killer: kill.killer === null ? FLOOD_NAME : this.nameOf(kill.killer),
      victim: this.nameOf(kill.victim),
      cause: kill.cause,
      involvesPlayer: kill.killer === 'player' || kill.victim === 'player',
    };
    this.items.push(line);
    // Only the latest lines stay.
    while (this.items.length > this.max) this.items.shift();
    return line;
  }

  get lines(): readonly FeedLine[] {
    return this.items;
  }
}
