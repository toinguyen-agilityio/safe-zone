import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { Strafer } from './strafe';

const { min, max } = config.bots.strafeTurnSeconds;
const dt = 0.05;

/** The seconds between each change of direction over a stretch of simulated time. */
function intervals(strafer: Strafer, seconds: number): number[] {
  const found: number[] = [];
  let last = strafer.side;
  let since = 0;
  for (let t = 0; t < seconds; t += dt) {
    since += dt;
    const side = strafer.update(dt);
    if (side !== last) {
      found.push(since);
      since = 0;
      last = side;
    }
  }
  return found;
}

describe('Strafer', () => {
  it('always gives a side, left or right', () => {
    const strafer = new Strafer(createRng(1));
    for (let i = 0; i < 200; i++) expect([-1, 1]).toContain(strafer.update(dt));
  });

  it('changes direction now and then, at random times within the configured range', () => {
    const changes = intervals(new Strafer(createRng(2)), 60);
    expect(changes.length).toBeGreaterThan(60 / max - 2);
    for (const gap of changes.slice(0, -1)) {
      expect(gap).toBeGreaterThanOrEqual(min - dt);
      expect(gap).toBeLessThanOrEqual(max + 2 * dt);
    }
    expect(new Set(changes.map((g) => g.toFixed(2))).size).toBeGreaterThan(3);
  });

  it('goes both ways', () => {
    const strafer = new Strafer(createRng(3));
    const seen = new Set<number>();
    for (let t = 0; t < 30; t += dt) seen.add(strafer.update(dt));
    expect(seen).toEqual(new Set([-1, 1]));
  });

  it('gives the same pattern for the same seed and another for a different seed', () => {
    const pattern = (seed: number) => intervals(new Strafer(createRng(seed)), 30);
    expect(pattern(5)).toEqual(pattern(5));
    expect(pattern(5)).not.toEqual(pattern(6));
  });

  it('survives one very long frame', () => {
    const strafer = new Strafer(createRng(4));
    expect([-1, 1]).toContain(strafer.update(100));
  });
});
