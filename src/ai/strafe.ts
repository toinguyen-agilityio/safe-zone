import { config } from '../config';
import type { Rng } from '../core/rng';

/** Which way a fighting bot sidesteps: -1 to the right, 1 to the left of where it faces. */
export type StrafeSide = -1 | 1;

/** Picks a strafe direction and changes it at random times, so a fighting bot is never still. */
export class Strafer {
  side: StrafeSide;
  private left: number;

  constructor(private readonly rng: Rng) {
    this.side = rng.float() < 0.5 ? -1 : 1;
    this.left = this.nextInterval();
  }

  /** Advance time and return the side to sidestep to now. */
  update(dt: number): StrafeSide {
    this.left -= dt;
    while (this.left <= 0) {
      this.side = this.side === 1 ? -1 : 1;
      this.left += this.nextInterval();
    }
    return this.side;
  }

  private nextInterval(): number {
    const { min, max } = config.bots.strafeTurnSeconds;
    return min + this.rng.float() * (max - min);
  }
}
