import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { currentSpread, type SpreadState } from './spread';

const standing: SpreadState = { moving: false, airborne: false, aiming: false };
const degrees = (radians: number) => (radians * 180) / Math.PI;

describe('spread by what the player is doing', () => {
  it('uses the values from the config', () => {
    const { standingDegrees, movingDegrees, airborneDegrees } = config.combat.spread;
    expect(degrees(currentSpread(standing))).toBeCloseTo(standingDegrees);
    expect(degrees(currentSpread({ ...standing, moving: true }))).toBeCloseTo(movingDegrees);
    expect(degrees(currentSpread({ ...standing, airborne: true }))).toBeCloseTo(airborneDegrees);
  });

  it('is larger when moving than standing, and larger still in the air', () => {
    const still = currentSpread(standing);
    const running = currentSpread({ ...standing, moving: true });
    const jumping = currentSpread({ ...standing, airborne: true });
    expect(running).toBeGreaterThan(still);
    expect(jumping).toBeGreaterThan(running);
  });

  it('is the same in the air whether or not a movement key is held', () => {
    expect(currentSpread({ moving: true, airborne: true, aiming: false })).toBe(
      currentSpread({ moving: false, airborne: true, aiming: false }),
    );
  });
});

describe('aiming', () => {
  it('shrinks the spread in every state', () => {
    for (const [moving, airborne] of [
      [false, false],
      [true, false],
      [false, true],
      [true, true],
    ] as const) {
      const hip = currentSpread({ moving, airborne, aiming: false });
      const aimed = currentSpread({ moving, airborne, aiming: true });
      expect(aimed).toBeLessThan(hip);
      expect(aimed).toBeCloseTo(hip * config.combat.spread.aimMultiplier);
    }
  });

  it('makes aiming while moving tighter than shooting from the hip while moving', () => {
    const aimedMoving = currentSpread({ ...standing, moving: true, aiming: true });
    const hipMoving = currentSpread({ ...standing, moving: true });
    expect(aimedMoving).toBeLessThan(hipMoving);
  });
});

describe('sanity', () => {
  it('is positive, finite and small, in radians', () => {
    for (const moving of [false, true]) {
      for (const airborne of [false, true]) {
        for (const aiming of [false, true]) {
          const spread = currentSpread({ moving, airborne, aiming });
          expect(spread).toBeGreaterThan(0);
          expect(Number.isFinite(spread)).toBe(true);
          expect(spread).toBeLessThan(0.2);
        }
      }
    }
  });
});
