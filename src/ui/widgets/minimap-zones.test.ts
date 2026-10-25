import { describe, expect, it } from 'vitest';
import { config } from '../../config';
import { EventBus } from '../../core/events';
import { ZoneSystem } from '../../systems/zone-system';
import { getLayout } from '../../world/layout';
import { drawMinimap, type MapContext, type MapZones } from './minimap';

function recorder() {
  const calls: { name: string; args: unknown[]; style: string }[] = [];
  const state = { strokeStyle: '' };
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push({ name, args, style: state.strokeStyle });
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
    lineWidth: 0,
    lineJoin: 'miter',
    set strokeStyle(value: string) {
      state.strokeStyle = value;
    },
    get strokeStyle() {
      return state.strokeStyle;
    },
  } as unknown as MapContext;
  return { g, calls };
}

const layout = getLayout();
const scale = 0.6;
const view = { x: 0, z: 0, yaw: 0 };

/** Arcs other than the round window: the zone circles. */
const circles = (calls: ReturnType<typeof recorder>['calls']) =>
  calls.filter((c) => c.name === 'arc').slice(1);

describe('minimap zone circles', () => {
  const zones: MapZones = {
    current: { center: { x: 20, z: -30 }, radius: 130 },
    next: { center: { x: 40, z: -10 }, radius: 68 },
  };

  it('draws the current and the next zone circle in different colors', () => {
    const { g, calls } = recorder();
    drawMinimap(g, layout, view, 180, scale, zones);
    const arcs = circles(calls);
    expect(arcs).toHaveLength(2);
    expect(arcs[0]!.args).toEqual([20 * scale, -30 * scale, 130 * scale, 0, Math.PI * 2]);
    expect(arcs[1]!.args).toEqual([40 * scale, -10 * scale, 68 * scale, 0, Math.PI * 2]);
    expect(arcs[0]!.style).not.toBe(arcs[1]!.style);
  });

  it('draws them in the map that turns with the view, before the marker', () => {
    const { g, calls } = recorder();
    drawMinimap(g, layout, { x: 0, z: 0, yaw: 0.9 }, 180, scale, zones);
    const names = calls.map((c) => c.name);
    const rotate = names.indexOf('rotate');
    // The first arc is the round window; the next ones are the zone circles.
    const firstCircle = names.indexOf('arc', names.indexOf('arc') + 1);
    expect(firstCircle).toBeGreaterThan(rotate);
    expect(names.lastIndexOf('fill')).toBeGreaterThan(names.lastIndexOf('arc'));
  });

  it('draws only the current zone after the last shrink', () => {
    const { g, calls } = recorder();
    drawMinimap(g, layout, view, 180, scale, { current: zones.current, next: null });
    expect(circles(calls)).toHaveLength(1);
  });

  it('draws no circles when there is no zone', () => {
    const { g, calls } = recorder();
    drawMinimap(g, layout, view, 180, scale);
    expect(circles(calls)).toHaveLength(0);
  });

  it('moves with the zone state as the match goes on', () => {
    const zone = new ZoneSystem(new EventBus(), 1);
    const radiusDrawn = () => {
      const { g, calls } = recorder();
      drawMinimap(g, layout, view, 180, scale, { current: zone.current, next: zone.next });
      return circles(calls)[0]!.args[2] as number;
    };
    const before = radiusDrawn();
    zone.update(config.zone.waitSeconds[0]! + 10);
    expect(radiusDrawn()).toBeLessThan(before);
  });
});
