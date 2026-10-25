import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { StuckDetector } from './stuck-detector';

const { progress, seconds, longSeconds } = config.bots.stuck;
const dt = 0.1;
const goal = { x: 0, z: -100 };

/** Hold still for some time and return the last level. */
function holdStill(detector: StuckDetector, time: number, at = { x: 0, z: 0 }, target = goal) {
  let level = detector.level;
  for (let t = 0; t < time; t += dt) level = detector.update(dt, at, target);
  return level;
}

describe('StuckDetector', () => {
  it('is free while the bot keeps getting closer', () => {
    const d = new StuckDetector();
    for (let i = 0; i < 100; i++) {
      expect(d.update(dt, { x: 0, z: -i * 0.5 }, goal)).toBe('free');
    }
  });

  it('reports stuck after the short timeout without progress', () => {
    const d = new StuckDetector();
    expect(holdStill(d, seconds - 0.5)).toBe('free');
    expect(holdStill(d, 1)).toBe('stuck');
  });

  it('reports long-stuck after the long timeout', () => {
    const d = new StuckDetector();
    holdStill(d, seconds + 0.5);
    expect(d.level).toBe('stuck');
    expect(holdStill(d, longSeconds)).toBe('long-stuck');
  });

  it('resets when the bot makes progress again', () => {
    const d = new StuckDetector();
    holdStill(d, seconds + 1);
    expect(d.level).toBe('stuck');
    expect(d.update(dt, { x: 0, z: -10 }, goal)).toBe('free');
    expect(d.stuckFor).toBe(0);
  });

  it('counts a tiny shuffle as no progress', () => {
    const d = new StuckDetector();
    let level = d.level;
    for (let t = 0; t < seconds + 1; t += dt) {
      level = d.update(dt, { x: 0, z: -(progress / 4) * Math.sin(t) }, goal);
    }
    expect(level).toBe('stuck');
  });

  it('does not count sliding along a wall at the same distance as progress', () => {
    const d = new StuckDetector();
    let level = d.level;
    for (let t = 0; t < seconds + 1; t += dt) {
      level = d.update(dt, { x: 0, z: 0 }, goal);
    }
    expect(level).toBe('stuck');
  });

  it('is free with no goal and forgets earlier time', () => {
    const d = new StuckDetector();
    holdStill(d, seconds + 1);
    expect(d.update(dt, { x: 0, z: 0 }, null)).toBe('free');
    expect(d.stuckFor).toBe(0);
  });

  it('starts over when the goal changes', () => {
    const d = new StuckDetector();
    holdStill(d, seconds + 1);
    expect(d.level).toBe('stuck');
    expect(d.update(dt, { x: 0, z: 0 }, { x: 50, z: 50 })).toBe('free');
  });

  it('keeps the same goal when it moves only a little', () => {
    const d = new StuckDetector();
    holdStill(d, seconds + 1);
    expect(d.update(dt, { x: 0, z: 0 }, { x: 0.3, z: -100 })).toBe('stuck');
  });
});
