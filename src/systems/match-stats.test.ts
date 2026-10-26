import { describe, expect, it } from 'vitest';
import type { DamageEvent } from './damage-system';
import type { KillRecord } from './kill-log';
import { MatchResults, PLAYERS_AT_START } from './match-stats';

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
const damage = (by: string | null, target: string, health: number, armor = 0): DamageEvent => ({
  target,
  health,
  armor,
  by,
  from: null,
});

/** Kill `count` bots by the flood, bot-1 up to bot-count. */
function killBots(results: MatchResults, count: number, from = 1, killer: string | null = null) {
  for (let i = from; i < from + count; i++) {
    results.onKill(kill(killer, `bot-${i}`, killer ? 'shot' : 'flood'), i);
  }
}

describe('MatchResults rank', () => {
  it('starts with 20 players and no result', () => {
    const results = new MatchResults();
    expect(PLAYERS_AT_START).toBe(20);
    expect(results.alive).toBe(20);
    expect(results.finished).toBe(false);
    expect(results.result).toBeNull();
  });

  it('is the number of players alive when the player dies, the player included', () => {
    const results = new MatchResults();
    killBots(results, 5);
    results.onKill(kill('bot-9', 'player'), 40);
    expect(results.result).toMatchObject({ rank: 15, won: false, survivalSeconds: 40 });
  });

  it('is 20 for the first player to die', () => {
    const results = new MatchResults();
    results.onKill(kill('bot-1', 'player'), 3);
    expect(results.result?.rank).toBe(20);
  });

  it('is 2 when the player dies in the final duel', () => {
    const results = new MatchResults();
    killBots(results, 18);
    results.onKill(kill('bot-19', 'player'), 90);
    expect(results.result).toMatchObject({ rank: 2, won: false });
  });

  it('is 1 for the winner, the last one alive', () => {
    const results = new MatchResults();
    killBots(results, 18, 1, 'player');
    expect(results.finished).toBe(false);
    results.onKill(kill('player', 'bot-19'), 120);
    expect(results.result).toMatchObject({ rank: 1, won: true, kills: 19, survivalSeconds: 120 });
  });

  it('remembers how the player died, and nothing for a win', () => {
    const shot = new MatchResults();
    shot.onKill(kill('bot-1', 'player'), 3);
    expect(shot.result?.cause).toBe('shot');
    const flood = new MatchResults();
    flood.onKill(kill(null, 'player', 'flood'), 3);
    expect(flood.result?.cause).toBe('flood');
    const win = new MatchResults();
    killBots(win, 19);
    expect(win.result?.cause).toBeNull();
  });

  it('is also won when the flood kills the last other player', () => {
    const results = new MatchResults();
    killBots(results, 19);
    expect(results.result).toMatchObject({ rank: 1, won: true, kills: 0 });
  });

  it('counts the flood as a death for the rank', () => {
    const results = new MatchResults();
    results.onKill(kill(null, 'player', 'flood'), 70);
    expect(results.result).toMatchObject({ rank: 20, won: false });
  });
});

describe('MatchResults kills and damage', () => {
  it('counts only the kills made by the player', () => {
    const results = new MatchResults();
    results.onKill(kill('player', 'bot-1'), 1);
    results.onKill(kill('bot-2', 'bot-3'), 2);
    results.onKill(kill(null, 'bot-4', 'flood'), 3);
    results.onKill(kill('player', 'bot-5'), 4);
    results.onKill(kill('bot-6', 'player'), 9);
    expect(results.result?.kills).toBe(2);
  });

  it('adds up the damage the player did to others, armor included', () => {
    const results = new MatchResults();
    results.onDamage(damage('player', 'bot-1', 25));
    results.onDamage(damage('player', 'bot-2', 18, 7));
    results.onDamage(damage('bot-3', 'bot-4', 25));
    results.onDamage(damage(null, 'bot-5', 12));
    results.onDamage(damage('bot-3', 'player', 25));
    results.onKill(kill('bot-3', 'player'), 5);
    expect(results.result?.damageDealt).toBe(50);
  });

  it('counts a victim once, and ignores news after the match is decided', () => {
    const results = new MatchResults();
    results.onKill(kill('player', 'bot-1'), 1);
    results.onKill(kill('player', 'bot-1'), 2);
    results.onKill(kill('bot-2', 'player'), 3);
    results.onKill(kill('bot-2', 'bot-3'), 4);
    results.onDamage(damage('player', 'bot-4', 25));
    expect(results.result).toMatchObject({ kills: 1, damageDealt: 0, rank: 19 });
  });
});
