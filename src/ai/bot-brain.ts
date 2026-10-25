import { config } from '../config';
import type { Rng } from '../core/rng';
import type { Bot } from '../entities/bot';
import type { BoxSource } from '../physics/collision';
import type { Box } from '../physics/spatial-grid';
import { collidePlayer } from '../systems/player-collision';

/** What a bot is doing: wandering with nobody in sight, running at a target, or holding to fight. */
export type BotMode = 'idle' | 'chase' | 'engage';

/** The part of a target the brain needs: where it stands. */
export interface TargetPosition {
  x: number;
  z: number;
}

/** Yaw looking from (fromX, fromZ) toward (toX, toZ); yaw 0 looks toward -z like the player's. */
export function yawToward(fromX: number, fromZ: number, toX: number, toZ: number): number {
  return Math.atan2(-(toX - fromX), -(toZ - fromZ));
}

/**
 * One bot's decisions. With a visible target it runs at it and stops at the engage range, then
 * holds and faces it until the target moves out past the disengage range. With none it wanders.
 * Walls stop it the same way they stop the player.
 */
export class BotBrain {
  mode: BotMode = 'idle';
  private heading = 0;
  private turnLeft = 0;

  constructor(private readonly rng: Rng) {}

  update(
    bot: Bot,
    target: TargetPosition | null,
    world: BoxSource | readonly Box[],
    dt: number,
  ): void {
    if (bot.parachuting || bot.health.dead) return;

    if (!target) {
      this.mode = 'idle';
      this.wander(bot, world, dt);
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
    if (this.mode === 'chase') this.move(bot, bot.yaw, config.bots.walkSpeed, world, dt);
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
