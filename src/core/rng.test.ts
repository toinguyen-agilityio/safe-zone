import { describe, expect, it } from 'vitest';
import { createRng } from './rng';

const sequence = (seed: number, count = 10) => {
  const rng = createRng(seed);
  return Array.from({ length: count }, () => rng.float());
};

describe('createRng', () => {
  it('gives the same sequence for the same seed', () => {
    expect(sequence(42)).toEqual(sequence(42));
  });

  it('gives different sequences for different seeds', () => {
    expect(sequence(1)).not.toEqual(sequence(2));
  });

  it('keeps float() in [0, 1)', () => {
    for (const value of sequence(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('keeps int(min, max) inclusive and in range', () => {
    const rng = createRng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(rng.int(2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });

  it('picks an item from the array', () => {
    const rng = createRng(9);
    const items = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) expect(items).toContain(rng.pick(items));
  });

  it('throws when picking from an empty array', () => {
    expect(() => createRng(1).pick([])).toThrow();
  });
});
