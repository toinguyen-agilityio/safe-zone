import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import type { Box } from '../physics/spatial-grid';
import { BotBrain } from './bot-brain';
import { Unsticker } from './unstick';

const landed = (x: number, z: number): Bot => {
  const bot = createBot(0, 'Anh Ba', x, z);
  bot.parachuting = false;
  bot.feetY = 0;
  return bot;
};

/** A long wall between the bot at the origin and a goal behind it. */
const wall = (halfLength = 60, offset = 0): Box => ({
  minX: -halfLength + offset,
  maxX: halfLength + offset,
  minZ: -14,
  maxZ: -12,
});
const goal = { x: 0, z: -40 };
const dist = (bot: Bot, g: { x: number; z: number }) => Math.hypot(bot.x - g.x, bot.z - g.z);

function walk(bot: Bot, world: Box[], seconds: number, seed = 1): BotBrain {
  const brain = new BotBrain(createRng(seed));
  for (let t = 0; t < seconds; t += 0.1) brain.update(bot, null, world, 0.1, goal);
  return brain;
}

describe('a bot blocked by a wall', () => {
  it('walks around a long wall and reaches the goal', () => {
    for (const seed of [1, 2, 3, 4]) {
      const bot = landed(0, 0);
      walk(bot, [wall()], 90, seed);
      expect(dist(bot, goal)).toBeLessThanOrEqual(config.bots.arriveDistance + 1);
    }
  });

  it('walks around a wall that is off to one side as well', () => {
    for (const seed of [1, 2, 3]) {
      const bot = landed(0, 0);
      walk(bot, [wall(40, 35)], 90, seed);
      expect(dist(bot, goal)).toBeLessThanOrEqual(config.bots.arriveDistance + 1);
    }
  });

  it('is deterministic for a seed', () => {
    const a = landed(0, 0);
    const b = landed(0, 0);
    walk(a, [wall()], 40, 7);
    walk(b, [wall()], 40, 7);
    expect([a.x, a.z]).toEqual([b.x, b.z]);
  });
});

describe('Unsticker', () => {
  const at = { x: 0, z: 0 };
  /** The goal is due north, so the way to it is yaw 0, left is positive and right negative. */
  const far = { x: 0, z: -50 };
  /** A way that is open or blocked ahead, to the left and to the right, as the brain would test it. */
  const ahead = (open: [boolean, boolean, boolean]): ((yaw: number) => boolean) => {
    return (yaw) => (Math.abs(yaw) < 1e-6 ? open[0] : yaw > 0 ? open[1] : open[2]);
  };
  const stuck = (u: Unsticker, canAdvance: (yaw: number) => boolean) => {
    let result: number | null = null;
    for (let t = 0; t < config.bots.stuck.seconds + 0.5; t += 0.1) {
      result = u.update(0.1, at, far, canAdvance);
    }
    return result;
  };

  it('goes straight while there is progress', () => {
    const u = new Unsticker();
    for (let i = 0; i < 50; i++)
      expect(u.update(0.1, { x: 0, z: -i }, far, () => false)).toBeNull();
    expect(u.active).toBe(false);
  });

  it('follows the wall sideways once the bot is stuck', () => {
    const u = new Unsticker(1);
    expect(stuck(u, ahead([false, true, true]))).toBeCloseTo(Math.PI / 2);
    expect(u.active).toBe(true);
  });

  it('starts on the other side when asked to', () => {
    const u = new Unsticker(-1);
    expect(stuck(u, ahead([false, true, true]))).toBeCloseTo(-Math.PI / 2);
  });

  it('keeps the same direction along the wall while it moves, however the goal turns', () => {
    const u = new Unsticker(1);
    stuck(u, ahead([false, true, true]));
    // Far along the wall the goal is at an angle, but the bot keeps following the wall.
    const along = u.update(0.1, { x: 30, z: 0 }, far, (yaw) => Math.abs(yaw - Math.PI / 2) < 1e-6);
    expect(along).toBeCloseTo(Math.PI / 2);
  });

  it('turns round when the wall stops it going along', () => {
    const u = new Unsticker(1);
    expect(stuck(u, ahead([false, false, true]))).toBeCloseTo(-Math.PI / 2);
  });

  it('heads for the goal again as soon as the way ahead is open', () => {
    const u = new Unsticker(1);
    stuck(u, ahead([false, true, true]));
    expect(u.update(0.1, at, far, ahead([true, true, true]))).toBeNull();
    expect(u.active).toBe(false);
  });

  it('does nothing without a goal', () => {
    const u = new Unsticker();
    for (let i = 0; i < 100; i++) expect(u.update(0.1, at, null, () => false)).toBeNull();
    expect(u.active).toBe(false);
  });
});
