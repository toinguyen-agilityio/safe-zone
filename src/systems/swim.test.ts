import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createPlayer, updatePlayer } from '../entities/player';
import { createGroundHeight } from '../physics/ground';
import { getBridges } from '../world/bridges';
import { getLayout, riverCenterX } from '../world/layout';
import { isSwimming, moveVelocity } from './swim';
import type { MoveKeys } from './movement';

const { walkSpeed, swimSpeed, sprintMultiplier } = config.player;
const layout = getLayout();
const bed = -config.world.river.bedDepth;
const water = config.world.river.waterLevel;
const halfRiver = layout.river.width / 2;
const forward: MoveKeys = { forward: true, back: false, left: false, right: false };
const speedOf = (v: { x: number; z: number }) => Math.hypot(v.x, v.z);

describe('isSwimming', () => {
  const z = -40;
  const mid = riverCenterX(z);

  it('is false on land and on the bank', () => {
    expect(isSwimming(0, 0, 0)).toBe(false);
    expect(isSwimming(mid - halfRiver - 5, z, 0)).toBe(false);
  });

  it('is true in the river with the feet below the water', () => {
    expect(isSwimming(mid, z, bed)).toBe(true);
    expect(isSwimming(mid + 10, z, water - 0.1)).toBe(true);
  });

  it('is false in the river while the feet are above the water, for example mid-jump', () => {
    expect(isSwimming(mid, z, 1)).toBe(false);
    expect(isSwimming(mid, z, water + 0.1)).toBe(false);
  });

  it('is false on a bridge deck or ramp over the water', () => {
    const bridge = getBridges(layout)[0]!;
    expect(isSwimming(riverCenterX(bridge.z), bridge.z, bridge.deckHeight)).toBe(false);
  });

  it('is true under a bridge deck, so swimming under a bridge is allowed', () => {
    const bridge = getBridges(layout)[0]!;
    const groundHeight = createGroundHeight(layout);
    const x = riverCenterX(bridge.z);
    const feet = groundHeight(x, bridge.z, bed); // the under-deck rule gives the river bed
    expect(feet).toBe(bed);
    expect(isSwimming(x, bridge.z, feet)).toBe(true);
    expect(speedOf(moveVelocity(forward, 0, true))).toBeGreaterThan(0);
  });
});

describe('moveVelocity', () => {
  it('walks at the walking speed on land', () => {
    expect(speedOf(moveVelocity(forward, 0, false))).toBeCloseTo(walkSpeed);
  });

  it('swims at the slow swim speed, slower than walking', () => {
    expect(swimSpeed).toBeLessThan(walkSpeed);
    expect(speedOf(moveVelocity(forward, 0, true))).toBeCloseTo(swimSpeed);
  });

  it('gives no extra speed for Shift while swimming', () => {
    const sprinting = { ...forward, sprint: true };
    expect(speedOf(moveVelocity(sprinting, 0, true))).toBeCloseTo(swimSpeed);
    expect(speedOf(moveVelocity(sprinting, 0, false))).toBeCloseTo(walkSpeed * sprintMultiplier);
  });

  it('keeps the direction of the view while swimming', () => {
    const v = moveVelocity(forward, Math.PI / 2, true);
    expect(v.x).toBeCloseTo(-swimSpeed);
    expect(v.z).toBeCloseTo(0);
  });
});

describe('the player in the water', () => {
  it('moves slowly when its swimming flag is set and normally when it is not', () => {
    const input = { keys: { ...forward, sprint: true }, mouseDelta: { x: 0, y: 0 }, locked: true };
    const swimmer = { ...createPlayer(), swimming: true };
    const walker = createPlayer();
    updatePlayer(swimmer, input, 1);
    updatePlayer(walker, input, 1);
    expect(Math.abs(swimmer.z)).toBeCloseTo(swimSpeed);
    expect(Math.abs(walker.z)).toBeCloseTo(walkSpeed * sprintMultiplier);
  });
});
