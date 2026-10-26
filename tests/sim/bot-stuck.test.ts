import { describe, expect, it } from 'vitest';
import { runMatch } from './headless-match';

/** At most this many bots may die while stuck on a wall in one match (S-28, criterion 4). */
const MAX_STUCK_DEATHS = 2;
const SEEDS = [1, 2, 3, 4, 5, 6];

describe('bots stuck on walls', () => {
  it.each(SEEDS)(
    'seed %i: at most 2 bots die while stuck',
    (seed) => {
      const result = runMatch(seed);
      const stuckDeaths = result.deaths.filter((d) => d.stuck);
      expect(stuckDeaths.length).toBeLessThanOrEqual(MAX_STUCK_DEATHS);
    },
    120_000,
  );

  it('plays real matches, not empty ones', () => {
    const result = runMatch(SEEDS[0]!);
    expect(result.deaths.length).toBeGreaterThan(0);
    expect(result.duration).toBeGreaterThan(30);
  }, 120_000);
});
