import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { readMoveKeys, walkVelocity, type MoveKeys } from './movement';

const none: MoveKeys = { forward: false, back: false, left: false, right: false };
const keys = (overrides: Partial<MoveKeys>): MoveKeys => ({ ...none, ...overrides });
const speed = config.player.walkSpeed;

describe('walkVelocity', () => {
  it('does not move without keys', () => {
    expect(walkVelocity(none, 1.2)).toEqual({ x: 0, z: 0 });
  });

  it('moves forward, back, left and right when looking along -z', () => {
    const f = walkVelocity(keys({ forward: true }), 0);
    expect(f.x).toBeCloseTo(0);
    expect(f.z).toBeCloseTo(-speed);
    expect(walkVelocity(keys({ back: true }), 0).z).toBeCloseTo(speed);
    expect(walkVelocity(keys({ left: true }), 0).x).toBeCloseTo(-speed);
    expect(walkVelocity(keys({ right: true }), 0).x).toBeCloseTo(speed);
  });

  it('turns with the view: after a quarter turn left, forward points to -x', () => {
    const v = walkVelocity(keys({ forward: true }), Math.PI / 2);
    expect(v.x).toBeCloseTo(-speed);
    expect(v.z).toBeCloseTo(0);
  });

  it('keeps diagonal speed the same as straight speed', () => {
    for (const yaw of [0, 0.7, 2.1]) {
      const v = walkVelocity(keys({ forward: true, right: true }), yaw);
      expect(Math.hypot(v.x, v.z)).toBeCloseTo(speed);
    }
  });

  it('cancels opposite keys', () => {
    expect(walkVelocity(keys({ forward: true, back: true }), 0)).toEqual({ x: 0, z: 0 });
    expect(walkVelocity(keys({ left: true, right: true }), 0)).toEqual({ x: 0, z: 0 });
  });

  it('uses a custom speed when given', () => {
    expect(walkVelocity(keys({ forward: true }), 0, 2).z).toBeCloseTo(-2);
  });
});

describe('readMoveKeys', () => {
  it('maps W, A, S and D', () => {
    const down = new Set(['KeyW', 'KeyD']);
    expect(readMoveKeys({ isDown: (code) => down.has(code) })).toEqual({
      forward: true,
      back: false,
      left: false,
      right: true,
    });
  });
});
