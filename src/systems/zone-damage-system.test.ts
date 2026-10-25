import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { Health } from '../entities/health';
import { KillLog } from './kill-log';
import type { DamageEvent } from './damage-system';
import { ZoneDamageSystem, type ZoneVictim } from './zone-damage-system';

/** A flood zone that is dry within 100 of the origin, in the given phase. */
const zoneAt = (phase: number) => ({
  phase,
  isDry: (x: number, z: number) => Math.hypot(x, z) <= 100,
});

const victim = (id: string, x: number, extra: Partial<ZoneVictim> = {}): ZoneVictim => ({
  id,
  x,
  z: 0,
  health: new Health(),
  ...extra,
});

function setup(phase: number, victims: ZoneVictim[]) {
  const events = new EventBus();
  const kills = new KillLog(events);
  const damages: DamageEvent[] = [];
  events.on('damage', (d) => damages.push(d));
  let clock = 0;
  const system = new ZoneDamageSystem({
    zone: zoneAt(phase),
    victims: () => victims,
    kills,
    now: () => clock,
    events,
  });
  /** Run simulated seconds in 0.1 s frames. */
  const run = (seconds: number) => {
    for (let i = 0; i < Math.round(seconds * 10); i++) {
      clock += 0.1;
      system.update(0.1);
    }
  };
  return { run, kills, damages };
}

describe('ZoneDamageSystem', () => {
  it('does no damage inside the dry zone', () => {
    const inside = victim('player', 50);
    const { run, damages } = setup(5, [inside]);
    run(10);
    expect(inside.health.health).toBe(100);
    expect(damages).toHaveLength(0);
  });

  it('drains health every second outside the zone', () => {
    const outside = victim('player', 300);
    const { run } = setup(1, [outside]);
    run(1);
    expect(outside.health.health).toBeCloseTo(100 - config.zone.drainPerSecond[0]!, 6);
    run(4);
    expect(outside.health.health).toBeCloseTo(100 - 5 * config.zone.drainPerSecond[0]!, 6);
  });

  it('drains faster in later phases', () => {
    const early = victim('a', 300);
    const late = victim('b', 300);
    setup(1, [early]).run(5);
    setup(4, [late]).run(5);
    expect(late.health.health).toBeLessThan(early.health.health);
  });

  it('applies to the player and to bots in the same way', () => {
    const player = victim('player', 300);
    const bot = victim('bot-1', -300);
    const safe = victim('bot-2', 0);
    const { run } = setup(3, [player, bot, safe]);
    run(3);
    expect(player.health.health).toBeCloseTo(bot.health.health, 6);
    expect(player.health.health).toBeLessThan(100);
    expect(safe.health.health).toBe(100);
  });

  it('ignores armor', () => {
    const armored = victim('player', 300);
    armored.health.addArmor(60);
    const { run } = setup(2, [armored]);
    run(2);
    expect(armored.health.armor).toBe(60);
    expect(armored.health.health).toBeCloseTo(100 - 2 * config.zone.drainPerSecond[1]!, 6);
  });

  it('emits a damage event with no shooter position', () => {
    const { run, damages } = setup(1, [victim('player', 300)]);
    run(0.5);
    expect(damages.length).toBeGreaterThan(0);
    expect(damages[0]).toMatchObject({ target: 'player', from: null });
  });

  it('records a flood kill with nobody credited, once, and calls onKilled', () => {
    let killed = 0;
    const doomed = victim('bot-3', 300, { onKilled: () => killed++ });
    const { run, kills } = setup(5, [doomed]);
    run(20);
    expect(doomed.health.dead).toBe(true);
    expect(killed).toBe(1);
    expect(kills.all).toHaveLength(1);
    expect(kills.all[0]).toMatchObject({ killer: null, victim: 'bot-3', cause: 'flood' });
    expect(kills.all[0]!.time).toBeGreaterThan(0);
    expect(kills.killsBy('bot-3')).toBe(0);
  });

  it('leaves the dead and those not in the match yet alone', () => {
    const falling = victim('bot-4', 300, { skip: true });
    const dead = victim('bot-5', 300);
    dead.health.damage(500, 'flood');
    const { run, damages } = setup(5, [falling, dead]);
    run(5);
    expect(falling.health.health).toBe(100);
    expect(damages).toHaveLength(0);
  });

  it('saves the player when they walk back into the dry zone', () => {
    const player = victim('player', 300);
    const { run } = setup(2, [player]);
    run(1);
    const hurt = player.health.health;
    player.x = 10;
    run(5);
    expect(player.health.health).toBe(hurt);
  });
});
