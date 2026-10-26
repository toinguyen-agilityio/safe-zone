export interface Rng {
  float(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
}

/** Seeded generator (mulberry32). The same seed always gives the same sequence. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const float = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    float,
    int: (min, max) => min + Math.floor(float() * (max - min + 1)),
    pick: (items) => {
      if (items.length === 0) throw new Error('pick() needs a non-empty array');
      return items[Math.floor(float() * items.length)] as (typeof items)[number];
    },
  };
}
