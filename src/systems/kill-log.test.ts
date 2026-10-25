import { describe, expect, it } from 'vitest';
import { EventBus } from '../core/events';
import { KillLog } from './kill-log';

describe('KillLog', () => {
  it('stores killer, victim, cause and time', () => {
    const log = new KillLog();
    log.recordKill({ killer: 'player', victim: 'bot-1', cause: 'shot', time: 12.5 });
    expect(log.all).toEqual([{ killer: 'player', victim: 'bot-1', cause: 'shot', time: 12.5 }]);
  });

  it('counts kills per entity', () => {
    const log = new KillLog();
    log.recordKill({ killer: 'player', victim: 'bot-1', cause: 'shot', time: 1 });
    log.recordKill({ killer: 'player', victim: 'bot-2', cause: 'shot', time: 2 });
    log.recordKill({ killer: 'bot-3', victim: 'bot-4', cause: 'shot', time: 3 });
    expect(log.killsBy('player')).toBe(2);
    expect(log.killsBy('bot-3')).toBe(1);
    expect(log.killsBy('nobody')).toBe(0);
  });

  it('does not credit anyone for a flood death', () => {
    const log = new KillLog();
    log.recordKill({ killer: null, victim: 'bot-1', cause: 'flood', time: 90 });
    expect(log.killsBy('bot-1')).toBe(0);
    expect(log.deathOf('bot-1')?.cause).toBe('flood');
  });

  it('finds how a victim died', () => {
    const log = new KillLog();
    log.recordKill({ killer: 'player', victim: 'bot-1', cause: 'shot', time: 5 });
    expect(log.deathOf('bot-1')?.killer).toBe('player');
    expect(log.deathOf('player')).toBeUndefined();
  });

  it('emits a kill event with the record', () => {
    const events = new EventBus();
    const seen: unknown[] = [];
    events.on('kill', (kill) => seen.push(kill));
    new KillLog(events).recordKill({ killer: 'player', victim: 'bot-1', cause: 'shot', time: 4 });
    expect(seen).toEqual([{ killer: 'player', victim: 'bot-1', cause: 'shot', time: 4 }]);
  });

  it('keeps its own copy of the record', () => {
    const log = new KillLog();
    const input = { killer: 'player', victim: 'bot-1', cause: 'shot' as const, time: 1 };
    log.recordKill(input);
    input.victim = 'changed';
    expect(log.all[0]?.victim).toBe('bot-1');
  });
});
