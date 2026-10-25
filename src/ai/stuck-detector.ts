import { config } from '../config';

export interface Spot {
  x: number;
  z: number;
}

export type StuckLevel = 'free' | 'stuck' | 'long-stuck';

/**
 * Notices a bot that is not getting anywhere. It watches the distance to the goal: every time the
 * bot gets meaningfully closer than ever before the clock restarts, and when the clock runs past
 * the short timeout the bot is stuck, and past the long timeout it is stuck for good.
 */
export class StuckDetector {
  private goal: Spot | null = null;
  private best = Infinity;
  private idle = 0;

  /** Call every frame with where the bot is and where it is trying to go (null for nowhere). */
  update(dt: number, position: Spot, goal: Spot | null): StuckLevel {
    if (!goal) {
      this.reset();
      return 'free';
    }
    // A new goal is a new chance: forget the old progress.
    if (!this.goal || Math.hypot(goal.x - this.goal.x, goal.z - this.goal.z) > 1) {
      this.reset();
      this.goal = { ...goal };
    }

    const distance = Math.hypot(goal.x - position.x, goal.z - position.z);
    if (distance < this.best - config.bots.stuck.progress) {
      this.best = distance;
      this.idle = 0;
    } else {
      this.idle += dt;
    }
    return this.level;
  }

  get level(): StuckLevel {
    const { seconds, longSeconds } = config.bots.stuck;
    if (this.idle >= longSeconds) return 'long-stuck';
    return this.idle >= seconds ? 'stuck' : 'free';
  }

  /** Seconds without progress. */
  get stuckFor(): number {
    return this.idle;
  }

  reset(): void {
    this.goal = null;
    this.best = Infinity;
    this.idle = 0;
  }
}
