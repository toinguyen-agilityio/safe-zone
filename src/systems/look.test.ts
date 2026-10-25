import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { applyMouseLook, pitchLimit, wrapAngle } from './look';

const level = { yaw: 0, pitch: 0 };

describe('applyMouseLook', () => {
  it('turns right when the mouse moves right and up when it moves up', () => {
    const next = applyMouseLook(level, 100, -50, 0.01);
    expect(next.yaw).toBeCloseTo(-1);
    expect(next.pitch).toBeCloseTo(0.5);
  });

  it('uses the configured sensitivity by default', () => {
    const next = applyMouseLook(level, 100, 0);
    expect(next.yaw).toBeCloseTo(-100 * config.player.lookSensitivity);
  });

  it('clamps the pitch to about 85 degrees either way', () => {
    expect(pitchLimit()).toBeCloseTo((85 * Math.PI) / 180);
    expect(applyMouseLook(level, 0, -100000).pitch).toBeCloseTo(pitchLimit());
    expect(applyMouseLook(level, 0, 100000).pitch).toBeCloseTo(-pitchLimit());
  });

  it('keeps yaw wrapped after many turns', () => {
    let state = level;
    for (let i = 0; i < 1000; i++) state = applyMouseLook(state, 37, 0, 0.01);
    expect(state.yaw).toBeGreaterThan(-Math.PI);
    expect(state.yaw).toBeLessThanOrEqual(Math.PI);
  });

  it('does not change the state it was given', () => {
    const state = { yaw: 1, pitch: 0.2 };
    applyMouseLook(state, 10, 10, 0.01);
    expect(state).toEqual({ yaw: 1, pitch: 0.2 });
  });
});

describe('wrapAngle', () => {
  it('wraps angles into (-PI, PI]', () => {
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(wrapAngle(-3 * Math.PI)).toBeCloseTo(Math.PI);
    expect(wrapAngle(0.5)).toBeCloseTo(0.5);
    expect(wrapAngle(Math.PI + 0.1)).toBeCloseTo(-Math.PI + 0.1);
  });
});
