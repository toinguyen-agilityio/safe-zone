import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import { createCollisionWorld } from '../systems/player-collision';
import { getLayout } from '../world/layout';
import { BotBrain } from './bot-brain';
import { insideCircle, ZoneMover, zoneInfo, type ZoneInfo } from './zone-move';
import { EventBus } from '../core/events';
import { ZoneSystem } from '../systems/zone-system';

const world = createCollisionWorld(getLayout());
const next = { center: { x: -100, z: 60 }, radius: 40 };

const fakeZone = (extra: Partial<ZoneInfo> = {}): ZoneInfo => ({
  phase: 1,
  warning: true,
  next,
  ...extra,
});

const landed = (x: number, z: number): Bot => {
  const bot = createBot(0, 'Anh Ba', x, z);
  bot.parachuting = false;
  bot.feetY = 0;
  return bot;
};

describe('ZoneMover', () => {
  it('sends a bot outside the next zone to a point inside it once the warning starts', () => {
    const mover = new ZoneMover(createRng(1));
    const spot = mover.update({ x: 150, z: -150 }, fakeZone(), world);
    expect(spot).not.toBeNull();
    expect(insideCircle(spot!, next)).toBe(true);
  });

  it('does nothing before the warning', () => {
    const mover = new ZoneMover(createRng(1));
    expect(mover.update({ x: 150, z: -150 }, fakeZone({ warning: false }), world)).toBeNull();
    expect(mover.update({ x: 150, z: -150 }, null, world)).toBeNull();
  });

  it('leaves a bot that is already inside the next zone where it is', () => {
    const mover = new ZoneMover(createRng(1));
    expect(mover.update({ x: -100, z: 60 }, fakeZone(), world)).toBeNull();
  });

  it('does nothing once the last shrink is over', () => {
    const mover = new ZoneMover(createRng(1));
    expect(mover.update({ x: 150, z: -150 }, fakeZone({ next: null }), world)).toBeNull();
  });

  it('keeps one destination during a phase and picks a new one for the next phase', () => {
    const mover = new ZoneMover(createRng(1));
    const a = mover.update({ x: 150, z: -150 }, fakeZone(), world);
    expect(mover.update({ x: 140, z: -140 }, fakeZone(), world)).toBe(a);
    const b = mover.update({ x: 140, z: -140 }, fakeZone({ phase: 2 }), world);
    expect(b).not.toBe(a);
  });
});

describe('zoneInfo', () => {
  it('starts the warning shortly before a shrink and keeps it through the shrink', () => {
    const zone = new ZoneSystem(new EventBus(), 1);
    expect(zoneInfo(zone).warning).toBe(false);
    zone.update(config.zone.waitSeconds[0]! - config.bots.zoneWarningSeconds + 1);
    expect(zoneInfo(zone).warning).toBe(true);
    zone.update(config.bots.zoneWarningSeconds);
    expect(zone.stage).toBe('shrink');
    expect(zoneInfo(zone).warning).toBe(true);
    expect(zoneInfo(zone).next?.radius).toBe(config.zone.radii[0]);
  });
});

describe('BotBrain heading for the zone', () => {
  it('walks toward the destination when nobody is in sight', () => {
    const bot = landed(100, -100);
    const brain = new BotBrain(createRng(1));
    const mover = new ZoneMover(createRng(2));
    const start = Math.hypot(bot.x - next.center.x, bot.z - next.center.z);
    for (let t = 0; t < 20; t += 0.1) {
      brain.update(bot, null, world, 0.1, mover.update(bot, fakeZone(), world));
    }
    expect(brain.mode).toBe('travel');
    expect(Math.hypot(bot.x - next.center.x, bot.z - next.center.z)).toBeLessThan(start - 40);
  });

  it('walks at normal speed, then stops travelling when it arrives', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(1));
    const goal = { x: 0, z: -30 };
    brain.update(bot, null, [], 1, goal);
    expect(bot.z).toBeCloseTo(-config.bots.walkSpeed);
    for (let t = 0; t < 20; t += 0.1) brain.update(bot, null, [], 0.1, goal);
    expect(Math.hypot(bot.x - goal.x, bot.z - goal.z)).toBeLessThanOrEqual(
      config.bots.arriveDistance + 1,
    );
    expect(brain.mode).toBe('idle');
  });

  it('fights instead of walking when an enemy is in sight', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(1));
    brain.update(bot, { x: 10, z: 0 }, [], 0.1, { x: 0, z: -100 });
    expect(brain.mode).toBe('engage');
  });

  it('wanders as before with no destination', () => {
    const bot = landed(0, 0);
    const brain = new BotBrain(createRng(1));
    brain.update(bot, null, [], 0.1);
    expect(brain.mode).toBe('idle');
  });
});
