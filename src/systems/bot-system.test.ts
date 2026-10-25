import { Group, Scene } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { getLayout } from '../world/layout';
import { spawnBots } from './bot-spawn';
import { BotSystem } from './bot-system';
import { createMotionWorld } from './player-motion';

const world = createMotionWorld(getLayout());

function setup() {
  const scene = new Scene();
  const system = new BotSystem(spawnBots(), scene, world, () => new Group());
  return { scene, system };
}

describe('BotSystem', () => {
  it('puts all 19 bots in the match and draws a model for each', () => {
    const { scene, system } = setup();
    expect(system.alive).toHaveLength(config.bots.count);
    expect(scene.children).toHaveLength(config.bots.count);
  });

  it('drops the bots and lands them all', () => {
    const { system } = setup();
    expect(system.alive.every((b) => b.parachuting)).toBe(true);
    for (let t = 0; t < 30; t += 0.1) system.update(0.1);
    expect(system.alive.every((b) => !b.parachuting)).toBe(true);
    expect(system.alive).toHaveLength(config.bots.count);
  });

  it('takes a dead bot out of the update list and off the scene', () => {
    const { scene, system } = setup();
    const victim = system.alive[3]!;
    victim.health.damage(500, 'gun');
    system.update(0.1);
    expect(system.alive).toHaveLength(config.bots.count - 1);
    expect(system.alive).not.toContain(victim);
    expect(scene.children).toHaveLength(config.bots.count - 1);
    expect(system.all).toContain(victim);
  });

  it('stops moving a dead bot', () => {
    const { system } = setup();
    const victim = system.alive[0]!;
    victim.health.damage(500, 'gun');
    system.update(0.1);
    const feet = victim.feetY;
    system.update(1);
    expect(victim.feetY).toBe(feet);
  });

  it('lets a living bot take damage and refuses a dead or unknown one', () => {
    const { system } = setup();
    const bot = system.alive[1]!;
    expect(system.damageable(bot.id)?.health).toBe(bot.health);
    expect(system.damageable('ghost')).toBeUndefined();
    bot.health.damage(500, 'gun');
    system.update(0.1);
    expect(system.damageable(bot.id)).toBeUndefined();
  });
});
