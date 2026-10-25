import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createParachutingPlayer, type Player, type PlayerInput } from '../entities/player';
import { distanceToBox } from '../physics/spatial-grid';
import { generateHouses } from '../world/houses';
import { getLayout } from '../world/layout';
import { createMotionWorld, updatePlayerMotion } from './player-motion';
import { rectToBox } from './player-collision';

const { eyeHeight, parachuteStartHeight, radius } = config.player;
const layout = getLayout();
const world = createMotionWorld(layout);
const dt = 1 / 60;
const seed = config.world.defaultSeed;

const idle: PlayerInput = {
  keys: { forward: false, back: false, left: false, right: false },
  mouseDelta: { x: 0, y: 0 },
  locked: true,
};

const feet = (p: Player) => p.y - eyeHeight;

const dropUntilLanded = (player: Player, input: PlayerInput = idle) => {
  let frames = 0;
  while (player.parachuting && frames < 60 * 120) {
    updatePlayerMotion(player, input, world, dt);
    frames++;
  }
  return frames * dt;
};

describe('the start of a match', () => {
  it('puts the player about 75 units up under the parachute at a seeded spot', () => {
    const player = createParachutingPlayer(seed);
    expect(player.parachuting).toBe(true);
    expect(feet(player)).toBe(parachuteStartHeight);
    expect(player.airborne).toBe(true);
    expect(Math.abs(player.x)).toBeLessThan(config.world.mapSize / 2);
    expect(Math.abs(player.z)).toBeLessThan(config.world.mapSize / 2);
  });

  it('faces the middle of the map and looks down at the city', () => {
    const player = createParachutingPlayer(seed);
    // Forward is (-sin yaw, -cos yaw): it must point from the start toward the origin.
    const forward = { x: -Math.sin(player.yaw), z: -Math.cos(player.yaw) };
    const toCenter = Math.hypot(player.x, player.z);
    expect(forward.x * player.x + forward.z * player.z).toBeCloseTo(-toCenter);
    expect(player.pitch).toBeLessThan(0);
  });

  it('starts at the same spot for the same seed and at another for a different seed', () => {
    const a = createParachutingPlayer(seed);
    const b = createParachutingPlayer(seed);
    const c = createParachutingPlayer(seed + 1);
    expect([a.x, a.z]).toEqual([b.x, b.z]);
    expect([a.x, a.z]).not.toEqual([c.x, c.z]);
  });
});

describe('falling', () => {
  it('descends frame by frame and stays under the parachute', () => {
    const player = createParachutingPlayer(seed);
    const first = player.y;
    updatePlayerMotion(player, idle, world, dt);
    expect(player.y).toBeLessThan(first);
    expect(player.parachuting).toBe(true);
    expect(player.airborne).toBe(true);
  });

  it('falls even before the mouse is captured, but ignores keys until then', () => {
    const player = createParachutingPlayer(seed);
    const { x, z } = player;
    const input: PlayerInput = {
      ...idle,
      locked: false,
      keys: { ...idle.keys, forward: true },
      jump: true,
    };
    for (let i = 0; i < 60; i++) updatePlayerMotion(player, input, world, dt);
    expect(player.x).toBe(x);
    expect(player.z).toBe(z);
    // Steady fall speed, not the fast one: Space did nothing.
    expect(parachuteStartHeight - feet(player)).toBeCloseTo(config.player.parachute.fallSpeed, 0);
  });

  it('drifts with WASD and falls faster with Space', () => {
    const slow = createParachutingPlayer(seed);
    const fast = createParachutingPlayer(seed);
    const steer = { ...idle, keys: { ...idle.keys, right: true } };
    const secondsSlow = dropUntilLanded(slow, steer);
    const secondsFast = dropUntilLanded(fast, { ...steer, jump: true });
    expect(secondsFast).toBeLessThan(secondsSlow);
    expect(slow.x).not.toBeCloseTo(createParachutingPlayer(seed).x, 0);
  });
});

describe('touchdown', () => {
  it('drops the parachute and starts walking control at the same spot', () => {
    const player = createParachutingPlayer(seed);
    dropUntilLanded(player);
    expect(player.parachuting).toBe(false);
    expect(player.airborne).toBe(false);
    expect(feet(player)).toBeLessThan(0.5);

    const before = { x: player.x, z: player.z };
    for (let i = 0; i < 30; i++) {
      updatePlayerMotion(player, { ...idle, keys: { ...idle.keys, forward: true } }, world, dt);
    }
    expect(Math.hypot(player.x - before.x, player.z - before.z)).toBeGreaterThan(1);
  });

  it('never lands inside a house, wherever the drop starts', () => {
    const houses = generateHouses(layout, seed).houses.map(rectToBox);
    for (const house of houses.slice(0, 60)) {
      const player = createParachutingPlayer(seed);
      player.x = (house.minX + house.maxX) / 2;
      player.z = (house.minZ + house.maxZ) / 2;
      dropUntilLanded(player);
      expect(player.parachuting).toBe(false);
      for (const box of houses) {
        expect(distanceToBox(player.x, player.z, box)).toBeGreaterThanOrEqual(radius - 1e-6);
      }
    }
  });

  it('lands on a bridge deck instead of falling through it', () => {
    const player = createParachutingPlayer(seed);
    const bridge = layout.bridges[0]!;
    player.x = (bridge.xStart + bridge.xEnd) / 2;
    player.z = bridge.z;
    dropUntilLanded(player);
    expect(feet(player)).toBeGreaterThan(1);
  });
});
