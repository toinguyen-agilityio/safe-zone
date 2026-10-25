import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createRng } from '../core/rng';
import { createPlayer, type Player } from '../entities/player';
import { EventBus } from '../core/events';
import { Weapon } from '../entities/weapon';
import { FireControl, type ShotEvent } from './fire-control';
import { applySpread, Recoil, type Vec3 } from './recoil';

const { kickDegrees, maxDegrees, recoverDegreesPerSecond, recoverDelaySeconds } =
  config.combat.recoil;
const deg = (radians: number) => (radians * 180) / Math.PI;
const dt = 1 / 60;

describe('Recoil', () => {
  it('kicks the view up with each shot', () => {
    const player = { pitch: 0 };
    const recoil = new Recoil();
    recoil.kick(player);
    expect(deg(player.pitch)).toBeCloseTo(kickDegrees);
    recoil.kick(player);
    expect(deg(player.pitch)).toBeCloseTo(2 * kickDegrees);
    expect(deg(recoil.amount)).toBeCloseTo(2 * kickDegrees);
  });

  it('never climbs past the maximum, however long the burst', () => {
    const player = { pitch: 0 };
    const recoil = new Recoil();
    for (let i = 0; i < 200; i++) recoil.kick(player);
    expect(deg(player.pitch)).toBeCloseTo(maxDegrees);
  });

  it('waits a moment after the last shot, then settles back to where the view started', () => {
    const player = { pitch: 0.1 };
    const recoil = new Recoil();
    for (let i = 0; i < 10; i++) recoil.kick(player);
    const raised = player.pitch;
    expect(raised).toBeGreaterThan(0.1);

    // During the delay nothing moves.
    for (let t = 0; t < recoverDelaySeconds - dt; t += dt) recoil.update(dt, player);
    expect(player.pitch).toBeCloseTo(raised);

    // After the delay it comes back down at the recovery speed, and stops at the start.
    for (let i = 0; i < 600; i++) recoil.update(dt, player);
    expect(player.pitch).toBeCloseTo(0.1);
    expect(recoil.amount).toBeCloseTo(0);
  });

  it('settles at the configured speed', () => {
    const player = { pitch: 0 };
    const recoil = new Recoil();
    for (let i = 0; i < 10; i++) recoil.kick(player);
    const start = player.pitch;
    for (let t = 0; t < recoverDelaySeconds + dt; t += dt) recoil.update(dt, player);
    const before = player.pitch;
    for (let i = 0; i < 30; i++) recoil.update(dt, player);
    expect(deg(before - player.pitch)).toBeCloseTo(recoverDegreesPerSecond * 0.5, 0);
    expect(start).toBeGreaterThan(before - 1e-9);
  });

  it('does not push the view below where the player left it when the player looked down meanwhile', () => {
    const player = { pitch: 0 };
    const recoil = new Recoil();
    for (let i = 0; i < 5; i++) recoil.kick(player);
    player.pitch -= 0.5; // the player pulled the mouse down to compensate
    for (let i = 0; i < 600; i++) recoil.update(dt, player);
    expect(player.pitch).toBeCloseTo(-0.5);
  });
});

describe('applySpread', () => {
  const forward: Vec3 = { x: 0, y: 0, z: -1 };
  const angleBetween = (a: Vec3, b: Vec3) =>
    Math.acos(Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));

  it('returns the same direction when the spread is zero', () => {
    expect(applySpread(forward, 0, createRng(1))).toEqual(forward);
  });

  it('keeps every shot inside the cone and gives unit vectors', () => {
    const rng = createRng(5);
    const spread = 0.05;
    for (let i = 0; i < 2000; i++) {
      const d = applySpread(forward, spread, rng);
      expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1);
      expect(angleBetween(d, forward)).toBeLessThanOrEqual(spread + 1e-9);
    }
  });

  it('spreads the shots across the cone, not on one line or at one point', () => {
    const rng = createRng(9);
    const spread = 0.05;
    let maxX = 0;
    let maxY = 0;
    let far = 0;
    for (let i = 0; i < 2000; i++) {
      const d = applySpread(forward, spread, rng);
      maxX = Math.max(maxX, Math.abs(d.x));
      maxY = Math.max(maxY, Math.abs(d.y));
      if (angleBetween(d, forward) > spread / 2) far++;
    }
    expect(maxX).toBeGreaterThan(spread * 0.9);
    expect(maxY).toBeGreaterThan(spread * 0.9);
    // Even across the disc, three quarters of the shots land in the outer ring.
    expect(far / 2000).toBeGreaterThan(0.65);
  });

  it('works for any direction, including straight up', () => {
    const rng = createRng(3);
    for (const direction of [
      { x: 0, y: 1, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0.6, y: 0.8, z: 0 },
    ]) {
      for (let i = 0; i < 200; i++) {
        const d = applySpread(direction, 0.1, rng);
        expect(angleBetween(d, direction)).toBeLessThanOrEqual(0.1 + 1e-9);
      }
    }
  });

  it('gives the same shots for the same seed', () => {
    const run = (seed: number) => {
      const rng = createRng(seed);
      return Array.from({ length: 5 }, () => applySpread(forward, 0.05, rng));
    };
    expect(run(2)).toEqual(run(2));
  });
});

describe('firing with spread and recoil', () => {
  class FakeInput {
    mouse = new Set<number>();
    keys = new Set<string>();
    isMouseDown = (button: number) => this.mouse.has(button);
    isDown = (code: string) => this.keys.has(code);
  }

  const setup = (
    state: { moving: boolean; airborne: boolean; aiming: boolean },
    withRecoil = true,
  ) => {
    const player: Player = { ...createPlayer(), y: 1.7 };
    const input = new FakeInput();
    input.mouse.add(0);
    const events = new EventBus();
    const shots: ShotEvent[] = [];
    events.on('shot', (shot) => shots.push(shot));
    const recoil = new Recoil();
    const control = new FireControl(new Weapon(10000), player, input, events, {
      rng: createRng(4),
      spreadState: () => state,
      recoil: withRecoil ? recoil : undefined,
    });
    return { player, input, shots, control, recoil };
  };

  const burst = (control: FireControl, seconds: number) => {
    for (let i = 0; i < Math.round(seconds / dt); i++) control.update(dt, true);
  };
  const meanOffset = (shots: ShotEvent[]) =>
    shots.reduce((sum, s) => sum + Math.hypot(s.direction.x, s.direction.y), 0) / shots.length;

  it('kicks the view up during a burst and settles it back after release', () => {
    const { player, input, control } = setup({ moving: false, airborne: false, aiming: false });
    const start = player.pitch;
    burst(control, 1);
    expect(player.pitch).toBeGreaterThan(start + 0.02);
    input.mouse.delete(0);
    burst(control, 3);
    expect(player.pitch).toBeCloseTo(start);
  });

  it('sends the first bullet where the player looks, before the first kick', () => {
    const { player, shots, control } = setup(
      { moving: false, airborne: false, aiming: false },
      true,
    );
    player.pitch = 0;
    control.update(dt, true);
    expect(shots).toHaveLength(1);
    // Straight ahead apart from a tiny standing spread; the kick came after the shot.
    expect(shots[0]!.direction.y).toBeLessThan(0.01);
  });

  it('spreads shots wider while moving than standing, and wider still in the air', () => {
    const run = (state: { moving: boolean; airborne: boolean; aiming: boolean }) => {
      const { shots, control } = setup(state, false);
      burst(control, 3);
      return meanOffset(shots);
    };
    const standing = run({ moving: false, airborne: false, aiming: false });
    const moving = run({ moving: true, airborne: false, aiming: false });
    const airborne = run({ moving: false, airborne: true, aiming: false });
    expect(moving).toBeGreaterThan(standing);
    expect(airborne).toBeGreaterThan(moving);
    const aimed = run({ moving: true, airborne: false, aiming: true });
    expect(aimed).toBeLessThan(moving);
  });
});
