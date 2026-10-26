import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { isGrounded, stepVertical, type VerticalState } from './vertical';

const { gravity, jumpSpeed } = config.player;
const dt = 1 / 120;

const standing: VerticalState = { y: 0, vy: 0 };

/** Run steps until the feet are back on the ground; return the path. */
const jumpArc = (ground = 0, holdKey = false) => {
  const path: VerticalState[] = [];
  let state: VerticalState = { y: ground, vy: 0 };
  for (let i = 0; i < 2000; i++) {
    state = stepVertical(state, holdKey || i === 0, ground, dt);
    path.push(state);
    if (i > 0 && isGrounded(state, ground)) break;
  }
  return path;
};

describe('stepVertical on the ground', () => {
  it('stays on the ground without a jump', () => {
    let state = standing;
    for (let i = 0; i < 100; i++) state = stepVertical(state, false, 0, dt);
    expect(state).toEqual({ y: 0, vy: 0 });
    expect(isGrounded(state, 0)).toBe(true);
  });

  it('starts a jump when the key is pressed on the ground', () => {
    const next = stepVertical(standing, true, 0, dt);
    expect(next.y).toBeGreaterThan(0);
    expect(next.vy).toBeGreaterThan(0);
  });
});

describe('a jump', () => {
  const path = jumpArc();

  it('rises to the expected height and falls back to the ground', () => {
    const apex = Math.max(...path.map((s) => s.y));
    expect(apex).toBeCloseTo((jumpSpeed * jumpSpeed) / (2 * gravity), 1);
    expect(path[path.length - 1]).toEqual({ y: 0, vy: 0 });
  });

  it('takes about twice the rise time to come back', () => {
    const seconds = path.length * dt;
    expect(seconds).toBeCloseTo((2 * jumpSpeed) / gravity, 1);
  });

  it('goes up and then down, never up again', () => {
    let peaked = false;
    for (let i = 1; i < path.length; i++) {
      if (path[i]!.y < path[i - 1]!.y) peaked = true;
      if (peaked) expect(path[i]!.y).toBeLessThanOrEqual(path[i - 1]!.y);
    }
    expect(peaked).toBe(true);
  });
});

describe('no double jump', () => {
  it('lasts exactly as long with the key held the whole time as with one press', () => {
    // Holding the key must not restart the jump in mid-air: both arcs land on the same step.
    const onePress = jumpArc(0, false);
    const held = jumpArc(0, true);
    expect(held.length).toBe(onePress.length);
    expect(Math.max(...held.map((s) => s.y))).toBeCloseTo(Math.max(...onePress.map((s) => s.y)));
  });

  it('does not add speed when pressed at the top of the jump', () => {
    const apex = jumpArc().reduce((a, b) => (b.y > a.y ? b : a));
    const next = stepVertical(apex, true, 0, dt);
    expect(next.vy).toBeLessThan(apex.vy);
  });
});

describe('different ground heights', () => {
  it('falls off a ledge when the ground drops away', () => {
    let state: VerticalState = { y: 0, vy: 0 };
    for (let i = 0; i < 400 && !(state.y <= -4 && state.vy === 0); i++) {
      state = stepVertical(state, false, -4, dt);
    }
    expect(state).toEqual({ y: -4, vy: 0 });
  });

  it('lands on a higher deck when a jump ends over it', () => {
    let state = stepVertical(standing, true, 0, dt);
    for (let i = 0; i < 2000 && !(i > 5 && state.vy === 0); i++) {
      state = stepVertical(state, false, 0.5, dt);
    }
    expect(state).toEqual({ y: 0.5, vy: 0 });
  });

  it('can jump from a higher ground', () => {
    const arc = jumpArc(6);
    const apex = Math.max(...arc.map((s) => s.y));
    expect(apex).toBeGreaterThan(6);
    expect(arc[arc.length - 1]).toEqual({ y: 6, vy: 0 });
  });
});
