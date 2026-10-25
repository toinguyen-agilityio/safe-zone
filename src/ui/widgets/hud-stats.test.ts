import { describe, expect, it } from 'vitest';
import { config } from '../../config';
import type { KillRecord } from '../../systems/kill-log';
import { MatchStats, statsView, TOTAL_PLAYERS } from './hud-stats';

const kill = (
  killer: string | null,
  victim: string,
  cause: 'shot' | 'flood' = 'shot',
): KillRecord => ({
  killer,
  victim,
  cause,
  time: 1,
});

describe('MatchStats', () => {
  it('starts with 20 alive and no kills', () => {
    const stats = new MatchStats();
    expect(TOTAL_PLAYERS).toBe(config.bots.count + 1);
    expect(stats.alive).toBe(20);
    expect(stats.kills).toBe(0);
  });

  it('drops the alive count on each kill, whoever did it', () => {
    const stats = new MatchStats();
    stats.onKill(kill('bot-1', 'bot-2'));
    stats.onKill(kill(null, 'bot-3', 'flood'));
    stats.onKill(kill('bot-4', 'player'));
    expect(stats.alive).toBe(17);
  });

  it('raises my kill count only when the player kills', () => {
    const stats = new MatchStats();
    stats.onKill(kill('player', 'bot-1'));
    stats.onKill(kill('bot-2', 'bot-3'));
    stats.onKill(kill('player', 'bot-4'));
    stats.onKill(kill(null, 'bot-5', 'flood'));
    expect(stats.kills).toBe(2);
    expect(stats.alive).toBe(16);
  });

  it('counts a victim only once', () => {
    const stats = new MatchStats();
    stats.onKill(kill('player', 'bot-1'));
    stats.onKill(kill('player', 'bot-1'));
    expect(stats.alive).toBe(19);
    expect(stats.kills).toBe(1);
  });

  it('never goes below zero', () => {
    const stats = new MatchStats(2);
    stats.onKill(kill('player', 'bot-1'));
    stats.onKill(kill('bot-2', 'player'));
    stats.onKill(kill('bot-2', 'bot-3'));
    expect(stats.alive).toBe(0);
  });
});

describe('statsView', () => {
  it('shows the numbers with Vietnamese labels', () => {
    const stats = new MatchStats();
    stats.onKill(kill('player', 'bot-1'));
    expect(statsView(stats)).toEqual({
      aliveLabel: 'Còn sống',
      alive: '19',
      killsLabel: 'Hạ gục',
      kills: '1',
    });
  });
});
