import { describe, expect, it } from 'vitest';
import { getLayout } from '../../world/layout';
import { drawMinimap, REDRAW_SECONDS, redrawDue, type MapContext } from './minimap';

/** A context that writes down what was drawn. */
function recorder() {
  const calls: { name: string; args: unknown[] }[] = [];
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push({ name, args });
    };
  const g = {
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    rotate: record('rotate'),
    fillRect: record('fillRect'),
    beginPath: record('beginPath'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    closePath: record('closePath'),
    arc: record('arc'),
    clip: record('clip'),
    fill: record('fill'),
    stroke: record('stroke'),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineJoin: 'miter',
  } as unknown as MapContext;
  return { g, calls };
}

const layout = getLayout();
const draw = (yaw: number, x = 10, z = -20) => {
  const r = recorder();
  drawMinimap(r.g, layout, { x, z, yaw }, 180, 0.6);
  return r.calls;
};

describe('drawMinimap', () => {
  it('rotates the map by the yaw of the player', () => {
    for (const yaw of [0, 0.7, Math.PI / 2, -1.2, 3]) {
      const rotations = draw(yaw).filter((c) => c.name === 'rotate');
      expect(rotations).toHaveLength(1);
      expect(rotations[0]!.args[0]).toBe(yaw);
    }
  });

  it('puts the player in the middle: the map is shifted by the player position after the turn', () => {
    const calls = draw(0.5, 100, 50);
    const translates = calls.filter((c) => c.name === 'translate');
    expect(translates[0]!.args).toEqual([90, 90]);
    expect(translates[1]!.args).toEqual([-100 * 0.6, -50 * 0.6]);
    // The turn comes between the two.
    const names = calls.map((c) => c.name);
    expect(names.indexOf('rotate')).toBeGreaterThan(names.indexOf('translate'));
  });

  it('draws every street', () => {
    const rects = draw(0).filter((c) => c.name === 'fillRect');
    // One for the ground and one for each street.
    expect(rects).toHaveLength(1 + layout.streets.length);
  });

  it('draws the river as one thick line', () => {
    const calls = draw(0);
    expect(calls.filter((c) => c.name === 'stroke')).toHaveLength(1);
    expect(calls.filter((c) => c.name === 'lineTo').length).toBeGreaterThan(30);
  });

  it('draws the player marker in the middle, after the map and without the turn', () => {
    const calls = draw(1.1);
    const lastRotate = calls.map((c) => c.name).lastIndexOf('rotate');
    const fillIndex = calls.map((c) => c.name).lastIndexOf('fill');
    expect(fillIndex).toBeGreaterThan(lastRotate);
    const lastTranslate = calls.filter((c) => c.name === 'translate').at(-1)!;
    expect(lastTranslate.args).toEqual([90, 90]);
  });

  it('clips the map to a round window', () => {
    const calls = draw(0);
    const arc = calls.find((c) => c.name === 'arc')!;
    expect(arc.args.slice(0, 3)).toEqual([90, 90, 90]);
    expect(calls.some((c) => c.name === 'clip')).toBe(true);
  });

  it('keeps saves and restores balanced', () => {
    const calls = draw(0);
    expect(calls.filter((c) => c.name === 'save')).toHaveLength(
      calls.filter((c) => c.name === 'restore').length,
    );
  });
});

describe('redrawDue', () => {
  it('draws the first time', () => {
    expect(redrawDue(1000, null)).toBe(true);
  });

  it('waits until the redraw time has passed since the last draw', () => {
    const interval = REDRAW_SECONDS * 1000;
    expect(redrawDue(1000 + interval - 1, 1000)).toBe(false);
    expect(redrawDue(1000 + interval, 1000)).toBe(true);
  });

  it('redraws 20 times a second at most, not on every frame of a fast screen', () => {
    let last: number | null = null;
    let draws = 0;
    // One second of a 144 Hz display.
    for (let t = 0; t < 1000; t += 1000 / 144) {
      if (redrawDue(t, last)) {
        last = t;
        draws++;
      }
    }
    expect(draws).toBeLessThanOrEqual(21);
    expect(draws).toBeGreaterThanOrEqual(17);
  });
});
