import { describe, expect, it } from 'vitest';
import { EventBus } from '../core/events';
import { createPlayer } from '../entities/player';
import { Health } from '../entities/health';
import { canFire } from '../entities/weapon';
import { connectDamage, type DamageEvent } from './damage-system';
import { KillLog } from './kill-log';
import type { HitEvent } from './shot';
import { createMotionWorld, updatePlayerMotion } from './player-motion';
import { getLayout } from '../world/layout';

function setup() {
  const events = new EventBus();
  const kills = new KillLog(events);
  const victim = { id: 'bot-1', health: new Health(), killed: 0 };
  const entity = { id: victim.id, health: victim.health, onKilled: () => victim.killed++ };
  connectDamage(events, {
    entity: (id) => (id === 'bot-1' ? entity : undefined),
    kills,
    now: () => 42,
  });
  const damages: DamageEvent[] = [];
  events.on('damage', (d) => damages.push(d));
  const hit = (damage = 25, shooter: string | null = 'player'): HitEvent => ({
    target: 'bot-1',
    region: 'torso',
    damage,
    distance: 10,
    shooter,
    origin: { x: 1, y: 2, z: 3 },
  });
  return { events, kills, victim, damages, hit };
}

describe('connectDamage', () => {
  it('lowers health on a hit', () => {
    const { events, victim, hit } = setup();
    events.emit('hit', hit());
    expect(victim.health.health).toBe(75);
  });

  it('takes armor first', () => {
    const { events, victim, hit } = setup();
    victim.health.addArmor(60);
    events.emit('hit', hit(40));
    expect(victim.health.armor).toBeCloseTo(60 - 18);
    expect(victim.health.health).toBeCloseTo(100 - 22);
  });

  it('emits a damage event with the shooter position', () => {
    const { events, damages, hit } = setup();
    events.emit('hit', hit());
    expect(damages).toEqual([
      { target: 'bot-1', health: 25, armor: 0, by: 'player', from: { x: 1, y: 2, z: 3 } },
    ]);
  });

  it('records a kill on the lethal hit only, and reports the death once', () => {
    const { events, kills, victim, hit } = setup();
    for (let i = 0; i < 3; i++) events.emit('hit', hit());
    expect(kills.all).toHaveLength(0);
    events.emit('hit', hit());
    expect(kills.all).toEqual([{ killer: 'player', victim: 'bot-1', cause: 'shot', time: 42 }]);
    expect(victim.killed).toBe(1);
  });

  it('ignores hits on the dead and on unknown targets', () => {
    const { events, kills, damages, victim, hit } = setup();
    for (let i = 0; i < 6; i++) events.emit('hit', hit());
    expect(kills.all).toHaveLength(1);
    expect(damages).toHaveLength(4);
    expect(victim.killed).toBe(1);
    events.emit('hit', { ...hit(), target: 'ghost' });
    expect(damages).toHaveLength(4);
  });
});

describe('a dead player', () => {
  it('can no longer shoot', () => {
    const player = createPlayer();
    expect(canFire(player)).toBe(true);
    player.dead = true;
    expect(canFire(player)).toBe(false);
  });

  it('can no longer move', () => {
    const player = createPlayer();
    player.dead = true;
    const { x, z, yaw } = player;
    updatePlayerMotion(
      player,
      {
        keys: { forward: true, back: false, left: false, right: false, sprint: false },
        mouseDelta: { x: 50, y: 0 },
        locked: true,
      },
      createMotionWorld(getLayout()),
      1,
    );
    expect({ x: player.x, z: player.z, yaw: player.yaw }).toEqual({ x, z, yaw });
  });
});
