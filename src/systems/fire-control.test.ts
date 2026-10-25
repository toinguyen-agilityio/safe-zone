import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { createPlayer, type Player } from '../entities/player';
import { Weapon } from '../entities/weapon';
import { FireControl, lookDirection, type ShotEvent } from './fire-control';

const { fireIntervalSeconds, magazineSize, reloadSeconds } = config.combat;
const dt = 1 / 60;

/** A fake keyboard and mouse the test can press and release. */
class FakeInput {
  mouse = new Set<number>();
  keys = new Set<string>();
  isMouseDown = (button: number) => this.mouse.has(button);
  isDown = (code: string) => this.keys.has(code);
}

const setup = (player: Player = { ...createPlayer(), y: 1.7 }) => {
  const input = new FakeInput();
  const events = new EventBus();
  const shots: ShotEvent[] = [];
  events.on('shot', (shot) => shots.push(shot));
  const weapon = new Weapon();
  const control = new FireControl(weapon, player, input, events);
  const run = (seconds: number, locked = true) => {
    let fired = 0;
    for (let i = 0; i < Math.round(seconds / dt); i++) fired += control.update(dt, locked);
    return fired;
  };
  return { input, events, shots, weapon, control, player, run };
};

describe('holding the left mouse button', () => {
  it('fires automatically at the weapon rate and emits one shot event per shot', () => {
    const { input, shots, run } = setup();
    input.mouse.add(0);
    const fired = run(1);
    expect(fired).toBeGreaterThanOrEqual(1 / fireIntervalSeconds);
    expect(fired).toBeLessThanOrEqual(1 / fireIntervalSeconds + 1);
    expect(shots).toHaveLength(fired);
  });

  it('stops when the button is released', () => {
    const { input, run } = setup();
    input.mouse.add(0);
    run(0.5);
    input.mouse.delete(0);
    expect(run(1)).toBe(0);
  });

  it('empties the magazine after 30 shots, then reloads by itself', () => {
    const { input, weapon, shots, run } = setup();
    input.mouse.add(0);
    run(reloadSeconds + magazineSize * fireIntervalSeconds + 1);
    expect(shots.length).toBeGreaterThan(magazineSize);
    expect(weapon.reserve).toBeLessThan(config.combat.startingReserve);
  });
});

describe('the shot event', () => {
  it('carries the eye position and the direction the player looks', () => {
    const player = { ...createPlayer(), x: 3, y: 1.7, z: -4, yaw: Math.PI / 2, pitch: 0.3 };
    const { input, shots, run } = setup(player);
    input.mouse.add(0);
    run(0.1);
    const [shot] = shots;
    expect(shot!.origin).toEqual({ x: 3, y: 1.7, z: -4 });
    expect(shot!.direction.x).toBeCloseTo(-Math.cos(0.3));
    expect(shot!.direction.y).toBeCloseTo(Math.sin(0.3));
    expect(shot!.direction.z).toBeCloseTo(0);
    expect(Math.hypot(shot!.direction.x, shot!.direction.y, shot!.direction.z)).toBeCloseTo(1);
  });

  it('looks toward -z with yaw and pitch at zero, and straight up with pitch 90 degrees', () => {
    expect(lookDirection(0, 0)).toEqual({ x: -0, y: 0, z: -1 });
    const up = lookDirection(0, Math.PI / 2);
    expect(up.y).toBeCloseTo(1);
    expect(up.z).toBeCloseTo(0);
  });
});

describe('the R key', () => {
  it('reloads once per press, not while held', () => {
    const { input, weapon, run } = setup();
    weapon.magazine = 5;
    input.keys.add('KeyR');
    run(reloadSeconds + 0.3);
    expect(weapon.magazine).toBe(magazineSize);
    expect(weapon.reserve).toBe(config.combat.startingReserve - 25);
    // Still held, magazine used up again: no new reload until it is pressed again.
    weapon.magazine = 5;
    run(reloadSeconds + 0.3);
    expect(weapon.magazine).toBe(5);
    input.keys.delete('KeyR');
    run(0.1);
    input.keys.add('KeyR');
    run(reloadSeconds + 0.3);
    expect(weapon.magazine).toBe(magazineSize);
  });
});

describe('when firing is not allowed', () => {
  it.each([
    ['swimming', { swimming: true }],
    ['parachuting', { parachuting: true }],
    ['sprinting', { sprinting: true }],
  ])('emits no shot event while %s', (_name, state) => {
    const { input, shots, weapon, run } = setup({ ...createPlayer(), ...state });
    input.mouse.add(0);
    expect(run(1)).toBe(0);
    expect(shots).toHaveLength(0);
    expect(weapon.magazine).toBe(magazineSize);
  });

  it('does not fire while the mouse is not captured', () => {
    const { input, shots, run } = setup();
    input.mouse.add(0);
    expect(run(1, false)).toBe(0);
    expect(shots).toHaveLength(0);
  });

  it('does not fire for the click that captures the mouse, only for a new press', () => {
    const { input, shots, run } = setup();
    input.mouse.add(0); // pressed before the mouse was captured
    run(0.2, false);
    run(0.5, true); // the mouse is now captured, but the same press is still down
    expect(shots).toHaveLength(0);
    input.mouse.delete(0);
    run(0.1);
    input.mouse.add(0);
    expect(run(0.3)).toBeGreaterThan(0);
  });
});
