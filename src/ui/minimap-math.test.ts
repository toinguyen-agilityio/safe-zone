import { describe, expect, it } from 'vitest';
import { toMinimap } from './minimap-math';

const player = { x: 100, z: -50 };
const close = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  expect(a.x).toBeCloseTo(b.x, 6);
  expect(a.y).toBeCloseTo(b.y, 6);
};

describe('toMinimap', () => {
  it('puts the player at the center', () => {
    close(toMinimap(player, player, 0.7, 2, { x: 80, y: 80 }), { x: 80, y: 80 });
    close(toMinimap(player, player, 2.1, 5), { x: 0, y: 0 });
  });

  it('shows a point in front of the player up the minimap, whatever the yaw', () => {
    for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 3, 2.4]) {
      const front = {
        x: player.x - Math.sin(yaw) * 10,
        z: player.z - Math.cos(yaw) * 10,
      };
      close(toMinimap(front, player, yaw, 2), { x: 0, y: -20 });
    }
  });

  it('shows a point behind the player down the minimap', () => {
    close(toMinimap({ x: 100, z: -40 }, player, 0, 3), { x: 0, y: 30 });
  });

  it('shows a point to the right of the player to the right, and left to the left', () => {
    // Yaw 0 looks toward -z, so +x is to the right.
    close(toMinimap({ x: 110, z: -50 }, player, 0, 1), { x: 10, y: 0 });
    close(toMinimap({ x: 90, z: -50 }, player, 0, 1), { x: -10, y: 0 });
  });

  it('turns the map with the view: after a quarter turn left, what was ahead is on the right', () => {
    // A positive yaw turns the view left (toward -x); the point at -z is now on the right.
    close(toMinimap({ x: 100, z: -60 }, player, Math.PI / 2, 1), { x: 10, y: 0 });
    // And what is now straight ahead is the point toward -x.
    close(toMinimap({ x: 90, z: -50 }, player, Math.PI / 2, 1), { x: 0, y: -10 });
  });

  it('scales the distance in pixels per world unit', () => {
    const a = toMinimap({ x: 100, z: -60 }, player, 0, 1);
    const b = toMinimap({ x: 100, z: -60 }, player, 0, 4);
    expect(b.y).toBeCloseTo(a.y * 4);
  });

  it('offsets from the given center', () => {
    close(toMinimap({ x: 100, z: -60 }, player, 0, 2, { x: 100, y: 100 }), { x: 100, y: 80 });
  });

  it('keeps distances the same under rotation', () => {
    const target = { x: 130, z: -10 };
    const base = toMinimap(target, player, 0, 1);
    for (const yaw of [0.5, 1.5, 3, -2]) {
      const p = toMinimap(target, player, yaw, 1);
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(Math.hypot(base.x, base.y), 6);
    }
  });
});
