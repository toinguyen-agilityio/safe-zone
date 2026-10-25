import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { readMoveKeys, walkVelocity, type MoveKeys } from './movement';

const { walkSpeed, sprintMultiplier } = config.player;
const forward: MoveKeys = { forward: true, back: false, left: false, right: false };

describe('sprint', () => {
  it('moves faster than walking while Shift is held', () => {
    const walking = walkVelocity(forward, 0);
    const sprinting = walkVelocity({ ...forward, sprint: true }, 0);
    expect(Math.hypot(sprinting.x, sprinting.z)).toBeGreaterThan(Math.hypot(walking.x, walking.z));
    expect(Math.hypot(sprinting.x, sprinting.z)).toBeCloseTo(walkSpeed * sprintMultiplier);
  });

  it('has a multiplier above 1 in the config', () => {
    expect(sprintMultiplier).toBeGreaterThan(1);
  });

  it('keeps the walking speed when Shift is not held or left out', () => {
    expect(
      Math.hypot(...Object.values(walkVelocity({ ...forward, sprint: false }, 0))),
    ).toBeCloseTo(walkSpeed);
    expect(Math.hypot(...Object.values(walkVelocity(forward, 0)))).toBeCloseTo(walkSpeed);
  });

  it('sprints in the direction of the keys and the view, diagonals included', () => {
    for (const yaw of [0, 1.1, -2.4]) {
      const v = walkVelocity({ ...forward, right: true, sprint: true }, yaw);
      expect(Math.hypot(v.x, v.z)).toBeCloseTo(walkSpeed * sprintMultiplier);
    }
    const left = walkVelocity(
      { forward: false, back: false, left: true, right: false, sprint: true },
      0,
    );
    expect(left.x).toBeCloseTo(-walkSpeed * sprintMultiplier);
  });

  it('does not move when sprinting without a direction', () => {
    const idle = { forward: false, back: false, left: false, right: false, sprint: true };
    expect(walkVelocity(idle, 0)).toEqual({ x: 0, z: 0 });
  });

  it('reads either Shift key', () => {
    const only = (code: string) => readMoveKeys({ isDown: (c) => c === code });
    expect(only('ShiftLeft').sprint).toBe(true);
    expect(only('ShiftRight').sprint).toBe(true);
    expect(only('KeyW').sprint).toBe(false);
  });
});
