import { yawToward } from './heading';
import { StuckDetector, type Spot } from './stuck-detector';

/** Whether the bot could take a step looking this way (a yaw, like the player's). */
export type CanAdvance = (yaw: number) => boolean;

const QUARTER = Math.PI / 2;

/**
 * Gets a stuck bot around an obstacle by following the wall. While the bot makes progress it walks
 * straight at its goal. When the stuck detector fires it picks a direction along the wall and keeps
 * walking that way; as soon as the straight way to the goal is open again it heads for the goal,
 * and when the wall stops it going along (a corner) it turns round and follows the wall the other
 * way.
 */
export class Unsticker {
  readonly detector = new StuckDetector();
  /** The direction being followed along the wall, or null while walking straight. */
  private along: number | null = null;
  private side: 1 | -1;

  constructor(initialSide: 1 | -1 = 1) {
    this.side = initialSide;
  }

  /** True while the bot is steering around something rather than walking straight. */
  get active(): boolean {
    return this.along !== null;
  }

  /**
   * Call every frame with the bot's place, its goal (null for none) and a way to test whether a
   * step in some direction is open. Returns the yaw to walk, or null to walk straight at the goal.
   */
  update(
    dt: number,
    position: Spot,
    goal: Spot | null,
    canAdvance: CanAdvance = () => false,
  ): number | null {
    if (!goal) {
      this.detector.reset();
      this.along = null;
      return null;
    }
    const toGoal = yawToward(position.x, position.z, goal.x, goal.z);

    if (this.along === null) {
      if (this.detector.update(dt, position, goal) === 'free') return null;
      // Blocked: choose a way along the wall, a quarter turn from the way to the goal.
      this.along = toGoal + this.side * QUARTER;
    }

    // The straight way is open again: back to walking at the goal.
    if (canAdvance(toGoal)) {
      this.along = null;
      this.detector.reset();
      return null;
    }
    // The wall stops the way along it too (a corner), so go the other way round.
    if (!canAdvance(this.along)) {
      this.side = this.side === 1 ? -1 : 1;
      this.along = Math.atan2(Math.sin(this.along + Math.PI), Math.cos(this.along + Math.PI));
    }
    return this.along;
  }
}
