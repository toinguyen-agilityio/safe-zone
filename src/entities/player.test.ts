import { describe, expect, it } from 'vitest';
import { PerspectiveCamera } from 'three';
import { config } from '../config';
import { applyPlayerToCamera } from '../render/first-person-camera';
import { createPlayer, updatePlayer, type PlayerInput } from './player';

const idle: PlayerInput = {
  keys: { forward: false, back: false, left: false, right: false },
  mouseDelta: { x: 0, y: 0 },
  locked: true,
};

describe('createPlayer', () => {
  it('stands at the spawn point with the eyes at eye height', () => {
    const player = createPlayer();
    expect(player.x).toBe(config.player.spawn.x);
    expect(player.z).toBe(config.player.spawn.z);
    expect(player.y).toBe(config.player.eyeHeight);
  });
});

describe('updatePlayer', () => {
  it('walks forward along -z at the walk speed', () => {
    const player = createPlayer();
    updatePlayer(player, { ...idle, keys: { ...idle.keys, forward: true } }, 0.5);
    expect(player.z).toBeCloseTo(-config.player.walkSpeed * 0.5);
    expect(player.x).toBeCloseTo(0);
  });

  it('walks relative to the view after turning', () => {
    const player = createPlayer();
    player.yaw = Math.PI / 2;
    updatePlayer(player, { ...idle, keys: { ...idle.keys, forward: true } }, 1);
    expect(player.x).toBeCloseTo(-config.player.walkSpeed);
  });

  it('turns the view with the mouse', () => {
    const player = createPlayer();
    updatePlayer(player, { ...idle, mouseDelta: { x: 100, y: -50 } }, 0.016);
    expect(player.yaw).toBeLessThan(0);
    expect(player.pitch).toBeGreaterThan(0);
  });

  it('ignores keys and mouse while the mouse is not captured', () => {
    const player = createPlayer();
    const before = { ...player };
    updatePlayer(
      player,
      {
        keys: { forward: true, back: false, left: false, right: false },
        mouseDelta: { x: 500, y: 500 },
        locked: false,
      },
      1,
    );
    expect(player).toEqual(before);
  });

  it('keeps the eyes at eye height while walking', () => {
    const player = createPlayer();
    updatePlayer(player, { ...idle, keys: { ...idle.keys, forward: true, right: true } }, 1);
    expect(player.y).toBe(config.player.eyeHeight);
  });
});

describe('applyPlayerToCamera', () => {
  it('puts the camera at the eyes with the player yaw and pitch', () => {
    const camera = new PerspectiveCamera();
    const player = { x: 3, y: 1.7, z: -4, yaw: 0.5, pitch: -0.2 };
    applyPlayerToCamera(camera, player);
    expect(camera.position.toArray()).toEqual([3, 1.7, -4]);
    expect(camera.rotation.y).toBeCloseTo(0.5);
    expect(camera.rotation.x).toBeCloseTo(-0.2);
    expect(camera.rotation.z).toBeCloseTo(0);
  });
});
