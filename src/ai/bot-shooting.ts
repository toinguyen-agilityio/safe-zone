import { config } from '../config';

/**
 * A bot's trigger discipline. After it first sees an enemy it waits the reaction time before it
 * may shoot; losing sight of the enemy, or switching to another one, starts the wait again.
 */
export class BotShooter {
  private seeing: string | null = null;
  private seenFor = 0;

  /**
   * Call every frame with the id of the enemy in sight, or null. Returns true when the bot has
   * had the target in view for the whole reaction time and may shoot.
   */
  update(dt: number, targetId: string | null): boolean {
    if (targetId !== this.seeing) {
      this.seeing = targetId;
      this.seenFor = 0;
    }
    if (this.seeing === null) return false;
    this.seenFor += dt;
    return this.seenFor >= config.bots.reactionSeconds;
  }

  /** The enemy being watched, or null. */
  get target(): string | null {
    return this.seeing;
  }
}
