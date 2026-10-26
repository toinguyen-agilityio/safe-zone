import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { createRng } from '../core/rng';
import { createBot, type Bot } from '../entities/bot';
import { Health } from '../entities/health';
import { connectDamage } from '../systems/damage-system';
import { KillLog } from '../systems/kill-log';
import type { HitEvent } from '../systems/shot';
import { BotFire, rollRegion } from './bot-fire';
import type { Combatant } from './targeting';

const dt = 0.05;
const { reactionSeconds, fireIntervalSeconds } = config.bots;

const landedBot = (): Bot => {
  const bot = createBot(0, 'Anh Ba', 0, 0);
  bot.parachuting = false;
  bot.feetY = 0;
  return bot;
};

const enemy = (x: number, extra: Partial<Combatant> = {}): Combatant => ({
  id: 'player',
  x,
  z: 0,
  feetY: 0,
  ...extra,
});

function setup(seed = 1) {
  const events = new EventBus();
  const hits: HitEvent[] = [];
  events.on('hit', (h) => hits.push(h));
  const bot = landedBot();
  return { fire: new BotFire(createRng(seed), events), bot, hits };
}

/** Fight for some seconds and return the shots fired. */
function fight(
  fire: BotFire,
  bot: Bot,
  target: Combatant | null,
  seconds: number,
  fighting = true,
) {
  let shots = 0;
  for (let t = 0; t < seconds; t += dt) shots += fire.update(dt, bot, target, fighting);
  return shots;
}

describe('BotFire', () => {
  it('does not shoot before the reaction delay', () => {
    const { fire, bot } = setup();
    expect(fight(fire, bot, enemy(10), reactionSeconds - 2 * dt)).toBe(0);
  });

  it('shoots after the delay, one shot per interval', () => {
    const { fire, bot } = setup();
    fight(fire, bot, enemy(10), reactionSeconds + dt);
    const shots = fight(fire, bot, enemy(10), 4);
    expect(shots).toBeGreaterThanOrEqual(Math.floor(4 / fireIntervalSeconds) - 1);
    expect(shots).toBeLessThanOrEqual(Math.ceil(4 / fireIntervalSeconds) + 1);
  });

  it('does not shoot when it is not fighting or has no target', () => {
    const { fire, bot } = setup();
    expect(fight(fire, bot, enemy(10), 3, false)).toBe(0);
    expect(fight(fire, bot, null, 3)).toBe(0);
  });

  it('uses the magazine and reloads like the player', () => {
    const { fire, bot } = setup();
    const start = fire.weapon.magazine;
    fight(fire, bot, enemy(10), 3);
    expect(fire.weapon.magazine).toBeLessThan(start);
    // Empty the gun: it reloads by itself from reserve and the reserve shrinks.
    fight(fire, bot, enemy(10), 60);
    expect(fire.weapon.reserve).toBeLessThan(config.combat.startingReserve);
  });

  it('runs dry when the reserve is gone and stops shooting', () => {
    const { fire, bot } = setup();
    fight(fire, bot, enemy(10), 400);
    expect(fire.weapon.magazine + fire.weapon.reserve).toBe(0);
    expect(fight(fire, bot, enemy(10), 5)).toBe(0);
  });

  it('sends hits with the shooter, region, damage and origin; misses send nothing', () => {
    const { fire, bot, hits } = setup(3);
    const shots = fight(fire, bot, enemy(8), 20);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThan(shots);
    for (const hit of hits) {
      expect(hit.shooter).toBe('bot-1');
      expect(hit.target).toBe('player');
      expect(['head', 'torso', 'legs']).toContain(hit.region);
      expect(hit.damage).toBe(hit.region === 'head' ? 50 : 25);
      expect(hit.origin).toEqual({ x: 0, y: config.player.eyeHeight, z: 0 });
      expect(hit.distance).toBeCloseTo(8);
    }
  });

  it('hits less far away than close up, and less against a runner', () => {
    const hitsAt = (target: Combatant) => {
      let total = 0;
      for (let seed = 1; seed <= 20; seed++) {
        const { fire, bot, hits } = setup(seed);
        fight(fire, bot, target, 10);
        total += hits.length;
      }
      return total;
    };
    const close = hitsAt(enemy(8));
    expect(hitsAt(enemy(90))).toBeLessThan(close);
    expect(hitsAt(enemy(8, { running: true }))).toBeLessThan(close);
    expect(hitsAt(enemy(8, { airborne: true }))).toBeLessThan(close);
  });

  it('gives the same hits for the same seed', () => {
    const run = (seed: number) => {
      const { fire, bot, hits } = setup(seed);
      fight(fire, bot, enemy(30), 10);
      return hits.map((h) => [h.region, h.distance]);
    };
    expect(run(4)).toEqual(run(4));
  });

  it('does nothing while parachuting or dead', () => {
    const { fire, bot, hits } = setup();
    bot.parachuting = true;
    expect(fight(fire, bot, enemy(10), 5)).toBe(0);
    bot.parachuting = false;
    bot.health.damage(500, 'flood');
    expect(fight(fire, bot, enemy(10), 5)).toBe(0);
    expect(hits).toHaveLength(0);
  });
});

describe('BotFire against the player', () => {
  it('can kill the player, and the kill is recorded with the bot as the killer', () => {
    const events = new EventBus();
    const kills = new KillLog(events);
    const player = { id: 'player', health: new Health() };
    connectDamage(events, {
      entity: (id) => (id === 'player' ? player : undefined),
      kills,
      now: () => 7,
    });
    const bot = landedBot();
    const fire = new BotFire(createRng(2), events);
    fight(fire, bot, enemy(6), 60);
    expect(player.health.dead).toBe(true);
    expect(kills.all).toEqual([{ killer: 'bot-1', victim: 'player', cause: 'shot', time: 7 }]);
  });
});

describe('rollRegion', () => {
  it('follows the configured odds', () => {
    const rng = createRng(9);
    const counts = { head: 0, torso: 0, legs: 0 };
    for (let i = 0; i < 5000; i++) counts[rollRegion(rng)]++;
    expect(counts.head / 5000).toBeCloseTo(config.bots.regionOdds.head, 1);
    expect(counts.torso / 5000).toBeCloseTo(config.bots.regionOdds.torso, 1);
    expect(counts.legs).toBeGreaterThan(0);
  });
});
