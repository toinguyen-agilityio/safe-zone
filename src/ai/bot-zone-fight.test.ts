import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import { BotBrain } from './bot-brain';

const landed = (x = 0, z = 0): Bot => {
  const bot = createBot(0, 'Anh Ba', x, z);
  bot.parachuting = false;
  bot.feetY = 0;
  return bot;
};

/** A bot heading north to a far destination, 100 away. */
const goal = { x: 0, z: -100 };
const { zoneFightRange, underFireSeconds } = config.bots;

describe('a bot moving to the zone', () => {
  it('keeps moving past an enemy that is far away', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const far = { x: 200, z: 0 };
    brain.update(bot, far, [], 1, goal);
    expect(brain.mode).toBe('travel');
    expect(bot.z).toBeLessThan(0);
  });

  it('stops to fight an enemy that is close', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const close = { x: zoneFightRange - 5, z: 0 };
    brain.update(bot, close, [], 1, goal);
    expect(['engage', 'chase']).toContain(brain.mode);
    expect(brain.mode).not.toBe('travel');
    expect(bot.yaw).not.toBeCloseTo(0);
  });

  it('fights an enemy just inside the range but not one just outside', () => {
    const near = new BotBrain(createRng(1));
    near.update(landed(), { x: zoneFightRange - 1, z: 0 }, [], 0.1, goal);
    expect(near.mode).not.toBe('travel');
    const away = new BotBrain(createRng(1));
    away.update(landed(), { x: zoneFightRange + 1, z: 0 }, [], 0.1, goal);
    expect(away.mode).toBe('travel');
  });

  it('stops to fight a far enemy when it takes damage, and goes on after a few seconds', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    const far = { x: 200, z: 0 };
    brain.update(bot, far, [], 0.1, goal);
    expect(brain.mode).toBe('travel');

    bot.health.damage(25, 'gun');
    brain.update(bot, far, [], 0.1, goal);
    expect(brain.underFire).toBe(true);
    expect(brain.mode).not.toBe('travel');

    for (let t = 0; t < underFireSeconds + 0.5; t += 0.1) brain.update(bot, far, [], 0.1, goal);
    expect(brain.underFire).toBe(false);
    expect(brain.mode).toBe('travel');
  });

  it('does not count armor-soaked or no damage as being under fire', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    brain.update(bot, null, [], 0.1, goal);
    brain.update(bot, null, [], 0.1, goal);
    expect(brain.underFire).toBe(false);
  });

  it('keeps moving to the destination when no enemy is in sight', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    for (let t = 0; t < 5; t += 0.1) brain.update(bot, null, [], 0.1, goal);
    expect(brain.mode).toBe('travel');
    expect(bot.z).toBeLessThan(-10);
  });
});

describe('a bot with no destination', () => {
  it('fights any visible enemy, far or close, as before', () => {
    const bot = landed();
    const brain = new BotBrain(createRng(1));
    brain.update(bot, { x: 200, z: 0 }, [], 0.1);
    expect(brain.mode).toBe('chase');
  });
});
