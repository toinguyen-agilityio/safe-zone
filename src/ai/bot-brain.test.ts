import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import type { Box } from '../physics/spatial-grid';
import { BotBrain, yawToward } from './bot-brain';

const landed = (x = 0, z = 0): Bot => {
  const bot = createBot(0, 'Anh Ba', x, z);
  bot.parachuting = false;
  bot.feetY = 0;
  return bot;
};

const distance = (bot: Bot, target: { x: number; z: number }) =>
  Math.hypot(target.x - bot.x, target.z - bot.z);

function run(
  brain: BotBrain,
  bot: Bot,
  target: { x: number; z: number } | null,
  seconds: number,
  world: Box[] = [],
) {
  for (let t = 0; t < seconds; t += 0.1) brain.update(bot, target, world, 0.1);
}

describe('yawToward', () => {
  it('looks toward -z at yaw 0 and turns left with positive yaw', () => {
    expect(yawToward(0, 0, 0, -10)).toBeCloseTo(0);
    expect(yawToward(0, 0, -10, 0)).toBeCloseTo(Math.PI / 2);
    expect(yawToward(0, 0, 10, 0)).toBeCloseTo(-Math.PI / 2);
  });
});

describe('BotBrain with a target', () => {
  it('runs toward it and stops at the engage range', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const target = { x: 0, z: -100 };
    run(brain, bot, target, 5);
    expect(brain.mode).toBe('chase');
    expect(distance(bot, target)).toBeLessThan(100 - 15);

    run(brain, bot, target, 30);
    expect(brain.mode).toBe('engage');
    // Strafing drifts it a little wider than the engage range, never past the disengage range.
    expect(distance(bot, target)).toBeLessThanOrEqual(config.bots.disengageRange);
    expect(distance(bot, target)).toBeGreaterThan(config.bots.engageRange - 1);
  });

  it('faces the target and sidesteps across the line to it while engaged', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(1));
    const target = { x: 20, z: 0 };
    let farthest = 0;
    for (let t = 0; t < 3; t += 0.1) {
      brain.update(bot, target, [], 0.1);
      farthest = Math.max(farthest, Math.abs(bot.z));
    }
    expect(brain.mode).toBe('engage');
    // Sideways is along z here; the bot does not close in or back off while it strafes.
    expect(farthest).toBeGreaterThan(1);
    expect(bot.x).toBeCloseTo(0, 0);
    expect(bot.yaw).toBeCloseTo(yawToward(bot.x, bot.z, 20, 0), 0);
  });

  it('chases again only after the target gets past the disengage range', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(1));
    run(brain, bot, { x: 20, z: 0 }, 1);
    expect(brain.mode).toBe('engage');
    run(brain, bot, { x: 27, z: 0 }, 1);
    expect(brain.mode).toBe('engage');
    run(brain, bot, { x: 40, z: 0 }, 0.2);
    expect(brain.mode).toBe('chase');
  });

  it('is stopped by a house on the way, like the player', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(1));
    const house: Box = { minX: 20, maxX: 30, minZ: -10, maxZ: 10 };
    run(brain, bot, { x: 100, z: 0 }, 20, [house]);
    expect(bot.x).toBeLessThanOrEqual(house.minX - config.player.radius + 1e-6);
  });

  it('walks slower than the player', () => {
    expect(config.bots.walkSpeed).toBeLessThan(config.player.walkSpeed);
  });
});

describe('BotBrain without a target', () => {
  it('idles and wanders slowly', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(2));
    run(brain, bot, null, 10);
    expect(brain.mode).toBe('idle');
    expect(distance(bot, { x: 0, z: 0 })).toBeGreaterThan(0);
    expect(distance(bot, { x: 0, z: 0 })).toBeLessThanOrEqual(config.bots.wanderSpeed * 10 + 1e-6);
  });

  it('is deterministic for a seed', () => {
    const a = landed();
    const b = landed();
    run(new BotBrain(createRng(5)), a, null, 8);
    run(new BotBrain(createRng(5)), b, null, 8);
    expect([a.x, a.z]).toEqual([b.x, b.z]);
  });

  it('goes back to idle when the target is lost', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    run(brain, bot, { x: 60, z: 0 }, 1);
    expect(brain.mode).toBe('chase');
    run(brain, bot, null, 1);
    expect(brain.mode).toBe('idle');
  });
});

describe('BotBrain when it cannot act', () => {
  it('does nothing under the parachute or when dead', () => {
    const falling = createBot(0, 'Anh Ba', 5, 5);
    const dead = landed(5, 5);
    dead.health.damage(500, 'flood');
    const brain = new BotBrain(createRng(1));
    run(brain, falling, { x: 50, z: 5 }, 2);
    run(brain, dead, { x: 50, z: 5 }, 2);
    expect([falling.x, falling.z, dead.x, dead.z]).toEqual([5, 5, 5, 5]);
  });
});
