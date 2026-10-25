import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import type { Box } from '../physics/spatial-grid';
import { BotBrain } from './bot-brain';
import { ZoneMover, type ZoneInfo } from './zone-move';
import { createCollisionWorld } from '../systems/player-collision';
import { getLayout } from '../world/layout';

const landed = (x = 0, z = 0): Bot => {
  const bot = createBot(0, 'Anh Ba', x, z);
  bot.parachuting = false;
  bot.feetY = 0;
  return bot;
};

/** A walled pen around (0, -40): nothing can get in. */
const pen: Box[] = [
  { minX: -10, maxX: 10, minZ: -52, maxZ: -50 },
  { minX: -10, maxX: 10, minZ: -30, maxZ: -28 },
  { minX: -12, maxX: -10, minZ: -52, maxZ: -28 },
  { minX: 10, maxX: 12, minZ: -52, maxZ: -28 },
];
const inside = { x: 0, z: -40 };

/** A big pen around (0, -100): the bot cannot get within fighting range of what is inside. */
const bigPen: Box[] = [
  { minX: -40, maxX: 40, minZ: -42, maxZ: -40 },
  { minX: -40, maxX: 40, minZ: -162, maxZ: -160 },
  { minX: -42, maxX: -40, minZ: -162, maxZ: -40 },
  { minX: 40, maxX: 42, minZ: -162, maxZ: -40 },
];
const farInside = { x: 0, z: -100 };

/** Walk until the brain gives up or the time is out. Returns what it gave up on and when. */
function walkUntilGivesUp(brain: BotBrain, run: () => void, limit = 200) {
  for (let t = 0; t < limit; t += 0.1) {
    run();
    const gave = brain.takeGiveUp();
    if (gave) return { gave, at: t };
  }
  return { gave: null, at: limit };
}

describe('a bot stuck for a long time', () => {
  it('gives up on a destination it cannot reach', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const { gave, at } = walkUntilGivesUp(brain, () => brain.update(bot, null, pen, 0.1, inside));
    expect(gave).toBe('destination');
    expect(at).toBeGreaterThan(config.bots.stuck.longSeconds);
    expect(at).toBeLessThan(150);
  });

  it('gives up on an enemy it cannot reach', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const { gave } = walkUntilGivesUp(brain, () => brain.update(bot, farInside, bigPen, 0.1));
    expect(gave).toBe('target');
  });

  it('reports a give-up once and clears the stuck state', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    walkUntilGivesUp(brain, () => brain.update(bot, null, pen, 0.1, inside));
    expect(brain.takeGiveUp()).toBeNull();
  });

  it('does not give up on a goal it can reach, even a long way round', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const wall: Box[] = [{ minX: -40, maxX: 40, minZ: -14, maxZ: -12 }];
    const goal = { x: 0, z: -40 };
    const { gave } = walkUntilGivesUp(brain, () => brain.update(bot, null, wall, 0.1, goal), 90);
    expect(gave).toBeNull();
    expect(Math.hypot(bot.x - goal.x, bot.z - goal.z)).toBeLessThanOrEqual(
      config.bots.arriveDistance + 1,
    );
  });
});

describe('ZoneMover after a give-up', () => {
  const world = createCollisionWorld(getLayout());
  const zone: ZoneInfo = {
    phase: 1,
    warning: true,
    next: { center: { x: -100, z: 60 }, radius: 60 },
  };

  it('picks a different destination when asked to reroll', () => {
    const mover = new ZoneMover(createRng(3));
    const first = mover.update({ x: 150, z: -150 }, zone, world);
    expect(mover.update({ x: 150, z: -150 }, zone, world)).toBe(first);
    mover.reroll();
    const second = mover.update({ x: 150, z: -150 }, zone, world);
    expect(second).not.toBeNull();
    expect(second).not.toEqual(first);
  });
});
