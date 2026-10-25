import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { startParachute, stepParachute, type ParachuteState } from './parachute';
import type { MoveKeys } from './movement';

const { fallSpeed, fastFallSpeed, driftSpeed } = config.player.parachute;
const dt = 1 / 60;
const none: MoveKeys = { forward: false, back: false, left: false, right: false };

/** Run until touchdown (or a long limit); returns the final state and the seconds taken. */
const fall = (start: ParachuteState, keys: MoveKeys, fast: boolean, ground = 0, yaw = 0) => {
  let state = start;
  let frames = 0;
  while (!state.landed && frames < 60 * 120) {
    state = stepParachute(state, keys, yaw, fast, ground, dt);
    frames++;
  }
  return { state, seconds: frames * dt };
};

describe('start', () => {
  it('begins about 75 units above the map at the chosen spot', () => {
    const state = startParachute(12, -30);
    expect(state).toEqual({
      x: 12,
      z: -30,
      feetY: config.player.parachuteStartHeight,
      landed: false,
    });
    expect(config.player.parachuteStartHeight).toBe(75);
  });
});

describe('falling', () => {
  it('descends at the steady speed and lands after about 75 / fallSpeed seconds', () => {
    const { state, seconds } = fall(startParachute(0, 0), none, false);
    expect(state.landed).toBe(true);
    expect(state.feetY).toBe(0);
    expect(seconds).toBeCloseTo(75 / fallSpeed, 0);
  });

  it('falls faster while Space is held and lands sooner', () => {
    const slow = fall(startParachute(0, 0), none, false).seconds;
    const fast = fall(startParachute(0, 0), none, true).seconds;
    expect(fastFallSpeed).toBeGreaterThan(fallSpeed);
    expect(fast).toBeLessThan(slow);
    expect(fast).toBeCloseTo(75 / fastFallSpeed, 0);
  });

  it('can switch between steady and fast fall mid-drop', () => {
    let state = startParachute(0, 0);
    state = stepParachute(state, none, 0, true, 0, 1);
    const afterFast = state.feetY;
    state = stepParachute(state, none, 0, false, 0, 1);
    expect(afterFast).toBeCloseTo(75 - fastFallSpeed);
    expect(state.feetY).toBeCloseTo(75 - fastFallSpeed - fallSpeed);
  });
});

describe('steering', () => {
  it('drifts with WASD relative to the view direction while descending', () => {
    const forward = stepParachute(startParachute(0, 0), { ...none, forward: true }, 0, false, 0, 1);
    expect(forward.z).toBeCloseTo(-driftSpeed);
    const turned = stepParachute(
      startParachute(0, 0),
      { ...none, forward: true },
      Math.PI / 2,
      false,
      0,
      1,
    );
    expect(turned.x).toBeCloseTo(-driftSpeed);
    const right = stepParachute(startParachute(0, 0), { ...none, right: true }, 0, false, 0, 1);
    expect(right.x).toBeCloseTo(driftSpeed);
  });

  it('does not drift without keys, and ignores Shift', () => {
    const still = stepParachute(startParachute(5, 5), none, 0, false, 0, 1);
    expect(still.x).toBe(5);
    expect(still.z).toBe(5);
    const shift = stepParachute(
      startParachute(0, 0),
      { ...none, forward: true, sprint: true },
      0,
      false,
      0,
      1,
    );
    expect(shift.z).toBeCloseTo(-driftSpeed);
  });

  it('covers a distance by steering for the whole descent, and stays inside the map', () => {
    const { state } = fall(startParachute(0, 0), { ...none, right: true }, false);
    expect(state.x).toBeCloseTo(driftSpeed * (75 / fallSpeed), 0);
    const edge = fall(startParachute(300, 0), { ...none, right: true }, false).state;
    expect(edge.x).toBeLessThanOrEqual(config.world.mapSize / 2 - config.player.radius + 1e-9);
  });
});

describe('touchdown', () => {
  it('is detected on the ground, and the player stops moving afterwards', () => {
    const landed = fall(startParachute(0, 0), none, false).state;
    const later = stepParachute(landed, { ...none, forward: true }, 0, true, 0, 1);
    expect(later).toEqual(landed);
  });

  it('lands on a higher ground, such as a bridge deck, instead of passing through it', () => {
    const { state } = fall(startParachute(0, 0), none, false, config.world.bridgeDeckHeight);
    expect(state.landed).toBe(true);
    expect(state.feetY).toBe(config.world.bridgeDeckHeight);
  });

  it('does not land while still above the ground', () => {
    const state = stepParachute(startParachute(0, 0), none, 0, false, 0, dt);
    expect(state.landed).toBe(false);
    expect(state.feetY).toBeLessThan(75);
  });
});
