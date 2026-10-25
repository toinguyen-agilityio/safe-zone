import { describe, expect, it } from 'vitest';
import type { RayBox } from '../physics/raycast';
import { pickTarget, type Combatant } from './targeting';

const at = (id: string, x: number, z = 0, extra: Partial<Combatant> = {}): Combatant => ({
  id,
  x,
  z,
  feetY: 0,
  ...extra,
});

const wall = (minX: number, maxX: number): RayBox => ({
  minX,
  maxX,
  minZ: -10,
  maxZ: 10,
  minY: 0,
  maxY: 12,
});

const me = at('bot-1', 0);

describe('pickTarget', () => {
  it('picks nobody when nobody is around', () => {
    expect(pickTarget(me, [], [])).toBeNull();
    expect(pickTarget(me, [me], [])).toBeNull();
  });

  it('picks the nearest of several enemies', () => {
    const near = at('bot-2', 20);
    const far = at('bot-3', 60);
    const side = at('bot-4', 0, -35);
    expect(pickTarget(me, [far, side, near], [])).toBe(near);
    expect(pickTarget(me, [near, side, far], [])).toBe(near);
  });

  it('treats the player and other bots as enemies', () => {
    const player = at('player', 15);
    const bot = at('bot-2', 40);
    expect(pickTarget(me, [bot, player], [])).toBe(player);
    expect(pickTarget(me, [bot], [])).toBe(bot);
  });

  it('never picks itself', () => {
    expect(pickTarget(me, [at('bot-1', 0.5), at('bot-2', 30)], [])?.id).toBe('bot-2');
  });

  it('ignores an enemy behind a house even when it is the nearest', () => {
    const hidden = at('bot-2', 20);
    const visible = at('bot-3', 0, 30);
    expect(pickTarget(me, [hidden, visible], [wall(10, 15)])).toBe(visible);
  });

  it('picks nobody when every enemy is behind houses', () => {
    expect(
      pickTarget(me, [at('bot-2', 20), at('bot-3', -20)], [wall(10, 15), wall(-15, -10)]),
    ).toBeNull();
  });

  it('ignores the dead and those still under the parachute', () => {
    const dead = at('bot-2', 10, 0, { dead: true });
    const falling = at('bot-3', 12, 0, { parachuting: true });
    const live = at('bot-4', 40);
    expect(pickTarget(me, [dead, falling, live], [])).toBe(live);
    expect(pickTarget(me, [dead, falling], [])).toBeNull();
  });

  it('keeps the type of what it was given', () => {
    const enemy = { ...at('bot-2', 10), name: 'Anh Ba' };
    expect(pickTarget(me, [enemy], [])?.name).toBe('Anh Ba');
  });
});
