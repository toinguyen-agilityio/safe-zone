import { Group, Object3D } from 'three';
import { EventBus } from '../src/core/events';
import { describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { AiSystem } from '../src/systems/ai-system';
import { connectDamage } from '../src/systems/damage-system';
import { KillLog } from '../src/systems/kill-log';
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
  const events = new EventBus();
  const bots = new BotSystem(spawnBots(), new Object3D(), world, () => new Group());
  const ai = new AiSystem(
    bots,
    world,
    createShotObstacles(layout),
    () => null,
    config.world.defaultSeed,
    events,
  );
  const kills = new KillLog(events);
  connectDamage(events, { entity: (id) => bots.damageable(id), kills, now: () => 0 });
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
  return { bots, ai, nearest, kills };
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

    // Once they shoot each other the field thins out, so look at the busiest and closest moment.
    let mostEngaged = 0;
    let closest = before;
    for (let t = 20; t < TIME_LIMIT_SECONDS; t += dt) {
      bots.update(dt);
      ai.update(dt);
      mostEngaged = Math.max(
        mostEngaged,
        bots.alive.filter((b) => ai.modeOf(b) === 'engage').length,
      );
      closest = Math.min(closest, nearest());
    }
    expect(mostEngaged).toBeGreaterThanOrEqual(2);
    expect(closest).toBeLessThan(before);
  }, 30_000);

  it('shoot each other: shots land, bots die and the kills are recorded', () => {
    const { bots, ai, kills } = simulate();
    for (let t = 0; t < 240; t += dt) {
      bots.update(dt);
      ai.update(dt);
    }
    expect(kills.all.length).toBeGreaterThanOrEqual(1);
    expect(bots.alive.length).toBe(config.bots.count - kills.all.length);
    for (const kill of kills.all) {
      expect(kill.cause).toBe('shot');
      expect(kill.killer).toMatch(/^bot-/);
      expect(kill.victim).toMatch(/^bot-/);
      expect(kill.killer).not.toBe(kill.victim);
    }
  }, 60_000);

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
