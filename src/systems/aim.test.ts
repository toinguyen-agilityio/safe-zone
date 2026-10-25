import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Aim, canAim } from './aim';

const hip = { swimming: false, parachuting: false, sprinting: false };
const { transitionSeconds } = config.combat.aim;

describe('canAim', () => {
  it('allows aiming on foot and nowhere shooting is blocked', () => {
    expect(canAim(hip)).toBe(true);
    expect(canAim({ ...hip, swimming: true })).toBe(false);
    expect(canAim({ ...hip, parachuting: true })).toBe(false);
    expect(canAim({ ...hip, sprinting: true })).toBe(false);
  });
});

describe('Aim', () => {
  it('starts at the hip', () => {
    const aim = new Aim();
    expect(aim.amount).toBe(0);
    expect(aim.aiming).toBe(false);
  });

  it('eases in smoothly while the button is held', () => {
    const aim = new Aim();
    aim.update(transitionSeconds / 4, { ...hip, wantsAim: true });
    expect(aim.amount).toBeCloseTo(0.25);
    expect(aim.aiming).toBe(true);
    aim.update(transitionSeconds, { ...hip, wantsAim: true });
    expect(aim.amount).toBe(1);
  });

  it('returns to the hip on release', () => {
    const aim = new Aim();
    aim.update(1, { ...hip, wantsAim: true });
    aim.update(transitionSeconds / 2, { ...hip, wantsAim: false });
    expect(aim.amount).toBeCloseTo(0.5);
    expect(aim.aiming).toBe(false);
    aim.update(1, { ...hip, wantsAim: false });
    expect(aim.amount).toBe(0);
  });

  it('does not aim while swimming, parachuting or sprinting', () => {
    for (const blocked of [{ swimming: true }, { parachuting: true }, { sprinting: true }]) {
      const aim = new Aim();
      aim.update(1, { ...hip, ...blocked, wantsAim: true });
      expect(aim.amount).toBe(0);
      expect(aim.aiming).toBe(false);
    }
  });

  it('lowers the rifle when sprinting starts mid-aim', () => {
    const aim = new Aim();
    aim.update(1, { ...hip, wantsAim: true });
    aim.update(1, { ...hip, sprinting: true, wantsAim: true });
    expect(aim.amount).toBe(0);
  });
});
