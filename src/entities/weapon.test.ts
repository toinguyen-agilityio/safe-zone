import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { canFire, Weapon, type WeaponCarrier, type WeaponIntent } from './weapon';

const { magazineSize, reloadSeconds, fireIntervalSeconds } = config.combat;

const onFoot: WeaponCarrier = { swimming: false, parachuting: false, sprinting: false };
const holdFire: WeaponIntent = { fire: true, reload: false };
const idle: WeaponIntent = { fire: false, reload: false };
const pressReload: WeaponIntent = { fire: false, reload: true };

/** Run the weapon for `seconds` of simulated time at the given frame rate; return the totals. */
function run(
  weapon: Weapon,
  seconds: number,
  intent: WeaponIntent,
  carrier: WeaponCarrier = onFoot,
  fps = 60,
) {
  const dt = 1 / fps;
  let shots = 0;
  let reloadsFinished = 0;
  let reloadsStarted = 0;
  const frames = Math.round(seconds * fps);
  for (let i = 0; i < frames; i++) {
    const result = weapon.update(dt, i === 0 ? intent : { ...intent, reload: false }, carrier);
    shots += result.shots;
    reloadsFinished += result.reloadFinished ? 1 : 0;
    reloadsStarted += result.reloadStarted ? 1 : 0;
  }
  return { shots, reloadsStarted, reloadsFinished };
}

describe('automatic fire', () => {
  it('shoots repeatedly at the configured rate while the trigger is held', () => {
    const weapon = new Weapon();
    const { shots } = run(weapon, 1, holdFire);
    const perSecond = 1 / fireIntervalSeconds;
    expect(shots).toBeGreaterThanOrEqual(perSecond);
    expect(shots).toBeLessThanOrEqual(perSecond + 1);
    expect(weapon.magazine).toBe(magazineSize - shots);
  });

  it('fires the first shot at once and nothing when the trigger is released', () => {
    const weapon = new Weapon();
    expect(weapon.update(1 / 60, holdFire, onFoot).shots).toBe(1);
    expect(run(weapon, 2, idle).shots).toBe(0);
  });

  it('shoots at the same rate at low and high frame rates', () => {
    for (const fps of [20, 30, 60, 144, 240]) {
      const { shots } = run(new Weapon(), 2, holdFire, onFoot, fps);
      expect(shots).toBeGreaterThanOrEqual(2 / fireIntervalSeconds);
      expect(shots).toBeLessThanOrEqual(2 / fireIntervalSeconds + 1);
    }
  });

  it('does not save up shots while the trigger is not held', () => {
    const weapon = new Weapon();
    run(weapon, 5, idle);
    expect(weapon.update(1 / 60, holdFire, onFoot).shots).toBe(1);
  });
});

describe('the magazine', () => {
  it('starts full and 30 shots empty it', () => {
    const weapon = new Weapon();
    expect(weapon.magazine).toBe(30);
    let shots = 0;
    for (let i = 0; i < 600 && weapon.magazine > 0; i++)
      shots += weapon.update(1 / 60, holdFire, onFoot).shots;
    expect(shots).toBe(30);
    expect(weapon.magazine).toBe(0);
  });

  it('never fires more than the magazine holds, even in one very long frame', () => {
    const weapon = new Weapon(0);
    const { shots } = { shots: weapon.update(10, holdFire, onFoot).shots };
    expect(shots).toBe(magazineSize);
    expect(weapon.magazine).toBe(0);
  });
});

describe('reloading', () => {
  it('starts by itself when the trigger is pulled on an empty magazine, and takes 1.8 s', () => {
    const empty = new Weapon(90);
    empty.magazine = 0;
    expect(empty.update(1 / 60, holdFire, onFoot).reloadStarted).toBe(true);
    expect(empty.reloading).toBe(true);
    run(empty, reloadSeconds - 0.1, idle);
    expect(empty.reloading).toBe(true);
    expect(empty.magazine).toBe(0);
    run(empty, 0.2, idle);
    expect(empty.reloading).toBe(false);
    expect(empty.magazine).toBe(magazineSize);
    expect(empty.reserve).toBe(90 - magazineSize);
  });

  it('reloads on the R key, topping up only what is missing', () => {
    const weapon = new Weapon(90);
    weapon.magazine = 12;
    const { reloadsStarted, reloadsFinished } = run(weapon, reloadSeconds + 0.2, pressReload);
    expect(reloadsStarted).toBe(1);
    expect(reloadsFinished).toBe(1);
    expect(weapon.magazine).toBe(magazineSize);
    expect(weapon.reserve).toBe(90 - 18);
  });

  it('does nothing on R when the magazine is full or there is no reserve', () => {
    const full = new Weapon(90);
    expect(full.update(1 / 60, pressReload, onFoot).reloadStarted).toBe(false);
    const noReserve = new Weapon(0);
    noReserve.magazine = 5;
    expect(noReserve.update(1 / 60, pressReload, onFoot).reloadStarted).toBe(false);
  });

  it('loads whatever is left when the reserve is smaller than the gap', () => {
    const weapon = new Weapon(10);
    weapon.magazine = 0;
    run(weapon, reloadSeconds + 0.2, pressReload);
    expect(weapon.magazine).toBe(10);
    expect(weapon.reserve).toBe(0);
  });

  it('cannot fire while reloading, and fires again once it is done', () => {
    const weapon = new Weapon(90);
    weapon.magazine = 10;
    weapon.update(1 / 60, pressReload, onFoot);
    expect(run(weapon, reloadSeconds - 0.2, holdFire).shots).toBe(0);
    run(weapon, 0.5, idle);
    expect(weapon.update(1 / 60, holdFire, onFoot).shots).toBe(1);
  });

  it('does not start a second reload while one is running', () => {
    const weapon = new Weapon(90);
    weapon.magazine = 10;
    const { reloadsStarted } = run(weapon, 1, pressReload);
    expect(reloadsStarted).toBe(1);
  });

  it('with no reserve left an empty magazine just clicks: no shots, no reload', () => {
    const weapon = new Weapon(0);
    weapon.magazine = 0;
    const result = run(weapon, 1, holdFire);
    expect(result).toEqual({ shots: 0, reloadsStarted: 0, reloadsFinished: 0 });
  });
});

describe('when the rifle cannot fire', () => {
  it.each([
    ['swimming', { ...onFoot, swimming: true }],
    ['parachuting', { ...onFoot, parachuting: true }],
    ['sprinting', { ...onFoot, sprinting: true }],
  ])('does not shoot while %s', (_name, carrier) => {
    expect(canFire(carrier)).toBe(false);
    const weapon = new Weapon();
    expect(run(weapon, 1, holdFire, carrier).shots).toBe(0);
    expect(weapon.magazine).toBe(magazineSize);
  });

  it('can fire on foot', () => {
    expect(canFire(onFoot)).toBe(true);
  });

  it('shoots again as soon as the blocking state ends', () => {
    const weapon = new Weapon();
    run(weapon, 1, holdFire, { ...onFoot, sprinting: true });
    expect(weapon.update(1 / 60, holdFire, onFoot).shots).toBe(1);
  });
});
