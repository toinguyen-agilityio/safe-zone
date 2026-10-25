import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { Pause, runUpdates } from '../core/pause';
import { ZoneSystem, type ZoneEvent } from './zone-system';
import { zoneDuration } from './zone';

const { waitSeconds, shrinkSeconds, radii, startRadius } = config.zone;

function setup(seed = 1) {
  const events = new EventBus();
  const log: { type: string; event: ZoneEvent }[] = [];
  events.on('zone:phase', (event) => log.push({ type: 'phase', event }));
  events.on('zone:shrink', (event) => log.push({ type: 'shrink', event }));
  return { zone: new ZoneSystem(events, seed), log };
}

/** A fake clock: advance in small steps like the game loop does. */
function advance(zone: ZoneSystem, seconds: number, step = 0.5) {
  for (let t = 0; t < seconds; t += step) zone.update(step);
}

describe('ZoneSystem', () => {
  it('starts at phase 1 on the full circle and announces it', () => {
    const { zone, log } = setup();
    expect(zone.phase).toBe(1);
    expect(zone.stage).toBe('wait');
    expect(zone.current.radius).toBe(startRadius);
    expect(log.map((l) => l.type)).toEqual(['phase']);
    expect(log[0]!.event.phase).toBe(1);
  });

  it('exposes the next circle the zone is heading for', () => {
    const { zone } = setup();
    expect(zone.next?.radius).toBe(radii[0]);
    expect(zone.next?.center).toEqual(zone.next?.center);
    advance(zone, waitSeconds[0]! + shrinkSeconds[0]! + 1);
    expect(zone.phase).toBe(2);
    expect(zone.next?.radius).toBe(radii[1]);
  });

  it('emits shrink when the wait is over, once per phase', () => {
    const { zone, log } = setup();
    advance(zone, waitSeconds[0]! - 1);
    expect(log.filter((l) => l.type === 'shrink')).toHaveLength(0);
    advance(zone, 3);
    advance(zone, 10);
    const shrinks = log.filter((l) => l.type === 'shrink');
    expect(shrinks).toHaveLength(1);
    expect(shrinks[0]!.event.phase).toBe(1);
    expect(shrinks[0]!.event.next.radius).toBe(radii[0]);
  });

  it('emits phase and shrink for all 5 phases in order, and nothing after the end', () => {
    const { zone, log } = setup();
    advance(zone, zoneDuration() + 30);
    expect(log.map((l) => `${l.type}${l.event.phase}`)).toEqual([
      'phase1',
      'shrink1',
      'phase2',
      'shrink2',
      'phase3',
      'shrink3',
      'phase4',
      'shrink4',
      'phase5',
      'shrink5',
    ]);
    expect(zone.next).toBeNull();
    expect(zone.current.radius).toBe(6);
    const count = log.length;
    advance(zone, 60);
    expect(log).toHaveLength(count);
  });

  it('still announces every phase after one very long frame', () => {
    const { zone, log } = setup();
    zone.update(waitSeconds[0]! + shrinkSeconds[0]! + 5);
    expect(zone.phase).toBe(2);
    // A long frame skips straight to the current phase: it is announced, not the ones jumped over.
    expect(log.at(-1)).toMatchObject({ type: 'phase', event: { phase: 2 } });
  });

  it('tells which points are dry', () => {
    const { zone } = setup();
    expect(zone.isDry(zone.current.center.x, zone.current.center.z)).toBe(true);
    expect(zone.isDry(zone.current.center.x + startRadius + 1, zone.current.center.z)).toBe(false);
  });

  it('only advances while the match runs, not while paused', () => {
    const { zone } = setup();
    const pause = new Pause();
    const updates = [(dt: number) => zone.update(dt)];
    runUpdates(updates, 10, pause);
    expect(zone.stageLeft).toBeCloseTo(waitSeconds[0]! - 10);
    pause.pause();
    runUpdates(updates, 30, pause);
    expect(zone.stageLeft).toBeCloseTo(waitSeconds[0]! - 10);
    pause.resume();
    runUpdates(updates, 5, pause);
    expect(zone.stageLeft).toBeCloseTo(waitSeconds[0]! - 15);
  });

  it('uses the same centers for the same seed', () => {
    const a = setup(3).zone;
    const b = setup(3).zone;
    advance(a, 200);
    advance(b, 200);
    expect(a.current).toEqual(b.current);
  });
});
