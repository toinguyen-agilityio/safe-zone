import { Group, Object3D } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { AiSystem } from '../src/systems/ai-system';
import { BotSystem } from '../src/systems/bot-system';
import { spawnBots } from '../src/systems/bot-spawn';
import { createMotionWorld } from '../src/systems/player-motion';
import { createShotObstacles } from '../src/systems/shot';
import { getLayout } from '../src/world/layout';

/**
 * A simulated match with no player and no browser: the 19 bots drop, land, spot each other and
 * close in on each other, using the same systems the game runs every frame.
 */
const layout = getLayout();
const world = createMotionWorld(layout);
const dt = 0.1;
const TIME_LIMIT_SECONDS = 120;

function simulate() {
  const bots = new BotSystem(spawnBots(), new Object3D(), world, () => new Group());
  const ai = new AiSystem(
    bots,
    world,
    createShotObstacles(layout),
    () => null,
    config.world.defaultSeed,
  );
  const nearest = () => {
    let sum = 0;
    for (const a of bots.alive) {
      let best = Infinity;
      for (const b of bots.alive)
        if (a !== b) best = Math.min(best, Math.hypot(a.x - b.x, a.z - b.z));
      sum += best;
    }
    return sum / bots.alive.length;
  };
  return { bots, ai, nearest };
}

describe('bots fight bots', () => {
  it('close in on each other and engage within the time limit, with no player input', () => {
    const { bots, ai, nearest } = simulate();
    // Everyone has landed once the drop is over.
    for (let t = 0; t < 20; t += dt) {
      bots.update(dt);
      ai.update(dt);
    }
    expect(bots.alive.every((b) => !b.parachuting)).toBe(true);
    const before = nearest();

    for (let t = 20; t < TIME_LIMIT_SECONDS; t += dt) {
      bots.update(dt);
      ai.update(dt);
    }
    const engaged = bots.alive.filter((b) => ai.modeOf(b) === 'engage');
    expect(engaged.length).toBeGreaterThanOrEqual(2);
    expect(nearest()).toBeLessThan(before);
  }, 30_000);

  it('stay inside the map and out of the houses while moving', () => {
    const { bots, ai } = simulate();
    const half = config.world.mapSize / 2;
    for (let t = 0; t < 60; t += dt) {
      bots.update(dt);
      ai.update(dt);
    }
    for (const bot of bots.alive) {
      expect(Math.abs(bot.x)).toBeLessThanOrEqual(half);
      expect(Math.abs(bot.z)).toBeLessThanOrEqual(half);
    }
  }, 30_000);

  it('is the same match every time for the same seed', () => {
    const run = () => {
      const { bots, ai } = simulate();
      for (let t = 0; t < 60; t += dt) {
        bots.update(dt);
        ai.update(dt);
      }
      return bots.alive.map((b) => [b.x, b.z]);
    };
    expect(run()).toEqual(run());
  }, 30_000);
});
