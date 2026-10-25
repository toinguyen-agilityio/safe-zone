import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createCollisionWorld } from './player-collision';
import { createMotionWorld } from './player-motion';
import { isFreeGround } from './landing';
import { spawnBots, stepBotDrop } from './bot-spawn';
import { getLayout } from '../world/layout';

const layout = getLayout();
const world = createMotionWorld(layout);

const quarter = (b: { x: number; z: number }) => (b.x >= 0 ? 1 : 0) + (b.z >= 0 ? 2 : 0);

function dropAll(bots: ReturnType<typeof spawnBots>): void {
  for (let t = 0; t < 40; t += 0.1) for (const bot of bots) stepBotDrop(bot, world, 0.1);
}

describe('spawnBots', () => {
  it('makes 19 bots with full health and different names', () => {
    const bots = spawnBots();
    expect(bots).toHaveLength(19);
    expect(new Set(bots.map((b) => b.name)).size).toBe(19);
    expect(new Set(bots.map((b) => b.id)).size).toBe(19);
    for (const bot of bots) expect(bot.health.health).toBe(100);
  });

  it('starts every bot high above the map under the parachute', () => {
    const half = config.world.mapSize / 2;
    for (const bot of spawnBots()) {
      expect(bot.parachuting).toBe(true);
      expect(bot.feetY).toBe(config.player.parachuteStartHeight);
      expect(Math.abs(bot.x)).toBeLessThan(half - config.bots.dropMargin);
      expect(Math.abs(bot.z)).toBeLessThan(half - config.bots.dropMargin);
    }
  });

  it('gives the same drop for the same seed and another for a different seed', () => {
    const key = (seed: number) => spawnBots(seed).map((b) => [b.name, b.x, b.z]);
    expect(key(5)).toEqual(key(5));
    expect(key(5)).not.toEqual(key(6));
  });

  it('spreads the bots: every map quarter has at least one, before and after landing', () => {
    const bots = spawnBots();
    const has = () => new Set(bots.map(quarter));
    expect(has().size).toBe(4);
    dropAll(bots);
    expect(has().size).toBe(4);
  });

  it('holds for other seeds too', () => {
    for (const seed of [1, 2, 3, 99]) {
      const bots = spawnBots(seed);
      dropAll(bots);
      expect(new Set(bots.map(quarter)).size).toBe(4);
    }
  });
});

describe('stepBotDrop', () => {
  it('falls at the steady speed and lands after the drop time', () => {
    const [bot] = spawnBots(undefined, 1);
    stepBotDrop(bot!, world, 1);
    expect(bot!.feetY).toBeCloseTo(
      config.player.parachuteStartHeight - config.player.parachute.fallSpeed,
    );
    expect(bot!.parachuting).toBe(true);
    dropAll([bot!]);
    expect(bot!.parachuting).toBe(false);
  });

  it('puts every bot on free ground, never inside a house', () => {
    const collision = createCollisionWorld(layout);
    for (const seed of [1, 2, 3, config.world.defaultSeed]) {
      const bots = spawnBots(seed);
      dropAll(bots);
      for (const bot of bots) {
        expect(bot.parachuting).toBe(false);
        expect(isFreeGround({ x: bot.x, z: bot.z }, config.player.radius, collision)).toBe(true);
      }
    }
  });

  it('leaves a landed bot alone', () => {
    const [bot] = spawnBots(undefined, 1);
    dropAll([bot!]);
    const { x, z, feetY } = bot!;
    stepBotDrop(bot!, world, 1);
    expect({ x: bot!.x, z: bot!.z, feetY: bot!.feetY }).toEqual({ x, z, feetY });
  });
});
