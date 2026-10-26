import { PerspectiveCamera } from 'three';
import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { riverCenterX } from '../world/layout';
import { applyMenuPose, menuCameraPose, ORBIT } from './menu-camera';

const centerX = riverCenterX(0);
const distanceToCenter = (p: { x: number; z: number }) => Math.hypot(p.x - centerX, p.z - 0);

describe('menuCameraPose', () => {
  it('circles around the river at a steady distance and height', () => {
    for (let t = 0; t <= ORBIT.lapSeconds; t += 7) {
      const pose = menuCameraPose(t);
      expect(distanceToCenter(pose)).toBeCloseTo(ORBIT.radius, 6);
      expect(pose.y).toBe(ORBIT.height);
    }
  });

  it('stays over the map and above the rooftops', () => {
    const half = config.world.mapSize / 2;
    for (let t = 0; t < ORBIT.lapSeconds; t += 3) {
      const pose = menuCameraPose(t);
      expect(Math.abs(pose.x)).toBeLessThan(half + config.world.edgePadding);
      expect(Math.abs(pose.z)).toBeLessThan(half);
      expect(pose.y).toBeGreaterThan(config.world.houses.riverHeight.max);
    }
  });

  it('moves smoothly: a short time later it has barely moved', () => {
    const a = menuCameraPose(10);
    const b = menuCameraPose(10.1);
    expect(Math.hypot(a.x - b.x, a.z - b.z)).toBeLessThan(2);
  });

  it('comes back to the start after one lap', () => {
    const start = menuCameraPose(0);
    const lap = menuCameraPose(ORBIT.lapSeconds);
    expect(lap.x).toBeCloseTo(start.x, 6);
    expect(lap.z).toBeCloseTo(start.z, 6);
  });

  it('keeps looking at the middle of the circle, whatever the time', () => {
    for (let t = 0; t < ORBIT.lapSeconds; t += 5) {
      const pose = menuCameraPose(t);
      const ahead = { x: -Math.sin(pose.yaw), z: -Math.cos(pose.yaw) };
      const toCenter = { x: centerX - pose.x, z: 0 - pose.z };
      const length = Math.hypot(toCenter.x, toCenter.z);
      expect(ahead.x * (toCenter.x / length) + ahead.z * (toCenter.z / length)).toBeCloseTo(1, 6);
    }
  });

  it('looks down at the city', () => {
    expect(menuCameraPose(0).pitch).toBeLessThan(0);
  });
});

describe('applyMenuPose', () => {
  it('puts the camera at the pose', () => {
    const camera = new PerspectiveCamera();
    const pose = menuCameraPose(12);
    applyMenuPose(camera, pose);
    expect(camera.position.toArray()).toEqual([pose.x, pose.y, pose.z]);
    expect(camera.rotation.y).toBeCloseTo(pose.yaw);
    expect(camera.rotation.x).toBeCloseTo(pose.pitch);
  });
});
