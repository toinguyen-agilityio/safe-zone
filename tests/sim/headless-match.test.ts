import { describe, expect, it } from 'vitest';
import { BOT_COUNT, runMatch } from './headless-match';

describe('runMatch', () => {
  it('plays a match without a renderer and reports deaths, duration and survivors', () => {
    const result = runMatch(1, { maxSeconds: 90 });
    expect(result.duration).toBeGreaterThan(0);
    expect(result.duration).toBeLessThanOrEqual(90 + 0.1);
    expect(result.deaths.length + result.survivors.length).toBe(BOT_COUNT);
    for (const death of result.deaths) {
      expect(['shot', 'flood']).toContain(death.cause);
      expect(typeof death.stuck).toBe('boolean');
      expect(death.time).toBeGreaterThan(0);
      if (death.cause === 'shot') expect(death.killer).toMatch(/^bot-/);
      else expect(death.killer).toBeNull();
    }
    expect(result.causes.shot + result.causes.flood).toBe(result.deaths.length);
  }, 60_000);

  it('gives the same result for the same seed', () => {
    const a = runMatch(2, { maxSeconds: 60 });
    const b = runMatch(2, { maxSeconds: 60 });
    expect(a).toEqual(b);
  }, 60_000);

  it('plays a different match for a different seed', () => {
    const a = runMatch(3, { maxSeconds: 60 });
    const b = runMatch(4, { maxSeconds: 60 });
    expect(a.deaths).not.toEqual(b.deaths);
  }, 60_000);

  it('names a winner only when exactly one bot is left', () => {
    const result = runMatch(5, { maxSeconds: 5 });
    expect(result.survivors).toHaveLength(BOT_COUNT);
    expect(result.winner).toBeNull();
  }, 60_000);

  it('runs a whole match to the end, with the flood doing its part', () => {
    const result = runMatch(6);
    expect(result.deaths.length).toBeGreaterThan(0);
    if (result.survivors.length === 1) expect(result.winner).toBe(result.survivors[0]);
    else expect(result.winner).toBeNull();
    expect(result.duration).toBeGreaterThan(60);
  }, 120_000);
});
