import { describe, expect, it } from 'vitest';
import { damageDirection } from './damage-direction';

const at = (yaw: number) => ({ x: 0, z: 0, yaw });

describe('damageDirection', () => {
  it('is 0 for a shooter straight ahead (toward -z at yaw 0)', () => {
    expect(damageDirection(at(0), { x: 0, z: -10 })).toBeCloseTo(0);
  });

  it('is a quarter turn to the right for a shooter on the right', () => {
    expect(damageDirection(at(0), { x: 10, z: 0 })).toBeCloseTo(Math.PI / 2);
  });

  it('is a quarter turn to the left for a shooter on the left', () => {
    expect(damageDirection(at(0), { x: -10, z: 0 })).toBeCloseTo(-Math.PI / 2);
  });

  it('is half a turn for a shooter behind', () => {
    expect(Math.abs(damageDirection(at(0), { x: 0, z: 10 }))).toBeCloseTo(Math.PI);
  });

  it('turns with the view: after turning left a quarter, a shooter ahead of the start is on the right', () => {
    // Positive yaw turns the view to the left, toward -x.
    expect(damageDirection(at(Math.PI / 2), { x: 0, z: -10 })).toBeCloseTo(Math.PI / 2);
    expect(damageDirection(at(Math.PI / 2), { x: -10, z: 0 })).toBeCloseTo(0);
  });

  it('measures from where the player stands', () => {
    expect(damageDirection({ x: 5, z: 5, yaw: 0 }, { x: 5, z: -20 })).toBeCloseTo(0);
    expect(damageDirection({ x: 5, z: 5, yaw: 0 }, { x: 25, z: 5 })).toBeCloseTo(Math.PI / 2);
  });
});
