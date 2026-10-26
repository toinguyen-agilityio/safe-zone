import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { addWindowPattern, createHouseMaterial, windowMask } from './house-material';

const { periodX, periodY, minHeight } = config.world.windows;

describe('windowMask', () => {
  it('puts a window in the middle of a cell and wall at its corner', () => {
    expect(windowMask(periodX / 2, periodY / 2 + 10 * periodY)).toBe(1);
    expect(windowMask(0.05, 10 * periodY + 0.05)).toBe(0);
  });

  it('repeats with the configured period, whatever the house size', () => {
    for (const [u, v] of [
      [1.2, 5.3],
      [7.7, 9.1],
      [30.4, 20.2],
    ] as const) {
      expect(windowMask(u + periodX, v)).toBe(windowMask(u, v));
      expect(windowMask(u, v + periodY)).toBe(windowMask(u, v));
    }
  });

  it('has no windows on the ground floor', () => {
    expect(windowMask(periodX / 2, minHeight / 2)).toBe(0);
  });

  it('covers part of the wall but not all of it', () => {
    let windows = 0;
    let total = 0;
    for (let u = 0; u < 30; u += 0.25) {
      for (let v = 3; v < 33; v += 0.25) {
        windows += windowMask(u, v);
        total++;
      }
    }
    expect(windows / total).toBeGreaterThan(0.1);
    expect(windows / total).toBeLessThan(0.5);
  });
});

describe('addWindowPattern', () => {
  const shader = {
    vertexShader: '#include <common>\n#include <begin_vertex>',
    fragmentShader: '#include <common>\n#include <color_fragment>',
  };
  addWindowPattern(shader);

  it('computes world position in the vertex shader, including instancing', () => {
    expect(shader.vertexShader).toContain('instanceMatrix');
    expect(shader.vertexShader).toContain('vHouseWorld');
  });

  it('uses the configured periods in the fragment shader', () => {
    expect(shader.fragmentShader).toContain(periodX.toFixed(4));
    expect(shader.fragmentShader).toContain(periodY.toFixed(4));
  });

  it('is attached to the house material', () => {
    expect(createHouseMaterial().onBeforeCompile).toBeTypeOf('function');
  });
});
