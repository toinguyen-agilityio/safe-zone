import { config } from '../config';
import type { Rng } from '../core/rng';
import type { Bot } from '../entities/bot';
import type { BoxSource } from '../physics/collision';
import type { Box } from '../physics/spatial-grid';
import { collidePlayer } from '../systems/player-collision';
import { yawToward } from './heading';
import { Strafer } from './strafe';
import { Unsticker } from './unstick';

/**
 * What a bot is doing: wandering with nobody in sight, walking to a destination, running at a
 * target, or fighting it.
 */
export type BotMode = 'idle' | 'chase' | 'engage' | 'travel';

/** The part of a target the brain needs: where it stands. */
export interface TargetPosition {
  x: number;
  z: number;
}

export { yawToward };

/**
 * One bot's decisions. With a visible target it runs at it and stops at the engage range, then
 * faces it and sidesteps back and forth until the target moves out past the disengage range. With none it wanders.
 * Walls stop it the same way they stop the player.
 */
export class BotBrain {
  mode: BotMode = 'idle';
  private heading = 0;
  private turnLeft = 0;
  /** Health and armor at the last update, to notice damage. */
  private lastHealth: number | null = null;
  private underFireLeft = 0;

  private readonly strafer: Strafer;
  private readonly unsticker: Unsticker;

  constructor(private readonly rng: Rng) {
    this.strafer = new Strafer(rng);
    this.unsticker = new Unsticker(rng.float() < 0.5 ? -1 : 1);
  }

  update(
    bot: Bot,
    target: TargetPosition | null,
    world: BoxSource | readonly Box[],
    dt: number,
    /** Where to walk when there is nobody to fight, for example into the next dry zone. */
    destination: TargetPosition | null = null,
  ): void {
    if (bot.parachuting || bot.health.dead) return;
    this.watchDamage(bot, dt);

    // On its way to the zone a bot only stops for an enemy that is close or shooting at it.
    if (target && destination && !this.worthFighting(bot, target)) target = null;

    if (!target) {
      const left = destination && Math.hypot(destination.x - bot.x, destination.z - bot.z);
      if (destination && left! > config.bots.arriveDistance) {
        this.mode = 'travel';
        this.walkTo(bot, destination, world, dt);
      } else {
        this.mode = 'idle';
        this.unsticker.update(dt, bot, null);
        this.wander(bot, world, dt);
      }
      return;
    }

    const distance = Math.hypot(target.x - bot.x, target.z - bot.z);
    const { engageRange, disengageRange } = config.bots;
    // Holding to fight has some give, so a target at the edge does not flip the bot back and forth.
    this.mode =
      distance <= engageRange || (this.mode === 'engage' && distance <= disengageRange)
        ? 'engage'
        : 'chase';
    bot.yaw = yawToward(bot.x, bot.z, target.x, target.z);
    if (this.mode === 'chase') {
      this.walkTo(bot, target, world, dt);
    } else {
      this.unsticker.update(dt, bot, null);
      // Fighting: sidestep across the line to the target, one way and then the other.
      const side = this.strafer.update(dt);
      this.move(bot, bot.yaw + (side * Math.PI) / 2, config.bots.strafeSpeed, world, dt);
    }
  }

  /** Walk toward a point at walking speed, going around whatever blocks the way. */
  private walkTo(
    bot: Bot,
    goal: TargetPosition,
    world: BoxSource | readonly Box[],
    dt: number,
  ): void {
    const toGoal = yawToward(bot.x, bot.z, goal.x, goal.z);
    const around = this.unsticker.update(dt, bot, goal, (yaw) => this.canStep(bot, yaw, world));
    this.move(bot, around ?? toGoal, config.bots.walkSpeed, world, dt);
    // While steering round an obstacle the bot still looks at where it is going.
    bot.yaw = toGoal;
  }

  /**
   * Could the bot take a step this way? Sliding along a wall does not count: the step has to carry
   * it forward in the direction it asked for.
   */
  private canStep(bot: Bot, yaw: number, world: BoxSource | readonly Box[]): boolean {
    const step = config.bots.unstick.probeStep;
    const dirX = -Math.sin(yaw);
    const dirZ = -Math.cos(yaw);
    const moved = { x: bot.x + dirX * step, z: bot.z + dirZ * step };
    collidePlayer(moved, { x: bot.x, z: bot.z }, world);
    const forward = (moved.x - bot.x) * dirX + (moved.z - bot.z) * dirZ;
    return forward >= step * 0.9;
  }

  /** Remember for a few seconds that the bot was hurt. */
  private watchDamage(bot: Bot, dt: number): void {
    const total = bot.health.health + bot.health.armor;
    if (this.lastHealth !== null && total < this.lastHealth) {
      this.underFireLeft = config.bots.underFireSeconds;
    }
    this.lastHealth = total;
    this.underFireLeft = Math.max(0, this.underFireLeft - dt);
  }

  private worthFighting(bot: Bot, target: TargetPosition): boolean {
    const close = Math.hypot(target.x - bot.x, target.z - bot.z) <= config.bots.zoneFightRange;
    return close || this.underFireLeft > 0;
  }

  /** True for a few seconds after the bot took damage. */
  get underFire(): boolean {
    return this.underFireLeft > 0;
  }

  private wander(bot: Bot, world: BoxSource | readonly Box[], dt: number): void {
    this.turnLeft -= dt;
    if (this.turnLeft <= 0) {
      const { min, max } = config.bots.wanderTurnSeconds;
      this.heading = this.rng.float() * Math.PI * 2;
      this.turnLeft = min + this.rng.float() * (max - min);
    }
    bot.yaw = this.heading;
    this.move(bot, this.heading, config.bots.wanderSpeed, world, dt);
  }

  private move(
    bot: Bot,
    yaw: number,
    speed: number,
    world: BoxSource | readonly Box[],
    dt: number,
  ): void {
    const previous = { x: bot.x, z: bot.z };
    bot.x += -Math.sin(yaw) * speed * dt;
    bot.z += -Math.cos(yaw) * speed * dt;
    collidePlayer(bot, previous, world);
  }
}
