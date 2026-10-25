import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { hitChance } from './hit-chance';

const still = { running: false, airborne: false };
const { close, far, nearRange, farRange } = config.bots.hitChance;

describe('hitChance', () => {
  it('is highest up close', () => {
    expect(hitChance({ distance: 0, ...still })).toBe(close);
    expect(hitChance({ distance: nearRange, ...still })).toBe(close);
  });

  it('is lowest at long range and no lower beyond it', () => {
    expect(hitChance({ distance: farRange, ...still })).toBeCloseTo(far);
    expect(hitChance({ distance: farRange * 5, ...still })).toBeCloseTo(far);
  });

  it('falls steadily with distance', () => {
    let last = Infinity;
    for (let d = 0; d <= farRange + 20; d += 10) {
      const chance = hitChance({ distance: d, ...still });
      expect(chance).toBeLessThanOrEqual(last);
      last = chance;
    }
    expect(hitChance({ distance: 80, ...still })).toBeLessThan(
      hitChance({ distance: 20, ...still }),
    );
  });

  it('is lower against a running target than a still one', () => {
    for (const distance of [5, 30, 70, 200]) {
      expect(hitChance({ distance, running: true, airborne: false })).toBeLessThan(
        hitChance({ distance, ...still }),
      );
    }
  });

  it('is lower against a jumping target than a still one, and lowest of all', () => {
    const jump = hitChance({ distance: 30, running: false, airborne: true });
    expect(jump).toBeLessThan(hitChance({ distance: 30, ...still }));
    expect(jump).toBeLessThan(hitChance({ distance: 30, running: true, airborne: false }));
    expect(hitChance({ distance: 30, running: true, airborne: true })).toBe(jump);
  });

  it('is always a probability', () => {
    for (const distance of [0, 1, 50, 99, 1000]) {
      for (const running of [false, true]) {
        for (const airborne of [false, true]) {
          const chance = hitChance({ distance, running, airborne });
          expect(chance).toBeGreaterThan(0);
          expect(chance).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});
