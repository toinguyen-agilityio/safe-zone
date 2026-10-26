import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Zone, zoneAt, zoneDuration } from './zone';

const { radii, waitSeconds, shrinkSeconds, startRadius } = config.zone;

/** Seconds from the start to the start of each phase's wait and shrink. */
function schedule() {
  const marks: { wait: number; shrink: number; end: number }[] = [];
  let t = 0;
  for (let i = 0; i < radii.length; i++) {
    const wait = t;
    const shrink = wait + waitSeconds[i]!;
    t = shrink + shrinkSeconds[i]!;
    marks.push({ wait, shrink, end: t });
  }
  return marks;
}

describe('zone phases', () => {
  it('starts at phase 1, waiting, at the full radius on the map middle', () => {
    const s = zoneAt(0);
    expect(s).toMatchObject({
      phase: 1,
      stage: 'wait',
      radius: startRadius,
      center: { x: 0, z: 0 },
    });
    expect(s.stageLeft).toBe(waitSeconds[0]);
  });

  it('walks through 5 phases, each a wait and then a shrink', () => {
    const seen: string[] = [];
    for (const [i, m] of schedule().entries()) {
      expect(zoneAt(m.wait + 0.1)).toMatchObject({ phase: i + 1, stage: 'wait' });
      expect(zoneAt(m.shrink + 0.1)).toMatchObject({ phase: i + 1, stage: 'shrink' });
      seen.push(`${i + 1}`);
    }
    expect(seen).toHaveLength(5);
  });

  it('holds the radius during a wait', () => {
    const [first, second] = schedule();
    expect(zoneAt(first!.wait + 30).radius).toBe(startRadius);
    expect(zoneAt(second!.wait + 10).radius).toBe(radii[0]);
  });

  it('ends each shrink at 230, 130, 68, 30 and 6 in order', () => {
    const ends = schedule().map((m) => zoneAt(m.end + 0.001).radius);
    expect(ends).toEqual([230, 130, 68, 30, 6]);
  });

  it('shrinks in a straight line during a shrink', () => {
    const m = schedule()[0]!;
    const half = zoneAt(m.shrink + shrinkSeconds[0]! / 2);
    expect(half.radius).toBeCloseTo((startRadius + radii[0]) / 2);
    expect(zoneAt(m.shrink + 1).radius).toBeLessThan(startRadius);
    expect(zoneAt(m.shrink + 1).radius).toBeGreaterThan(zoneAt(m.shrink + 20).radius);
  });

  it('is finished after the last shrink and stays at radius 6', () => {
    const done = zoneAt(zoneDuration() + 500);
    expect(done).toMatchObject({ phase: 5, stage: 'done', radius: 6, stageLeft: 0 });
  });

  it('never grows', () => {
    let last = Infinity;
    for (let t = 0; t <= zoneDuration() + 10; t += 1) {
      const r = zoneAt(t).radius;
      expect(r).toBeLessThanOrEqual(last + 1e-9);
      last = r;
    }
  });

  it('counts the time left in a stage', () => {
    expect(zoneAt(10).stageLeft).toBeCloseTo(waitSeconds[0]! - 10);
  });
});

describe('zone centers', () => {
  const centers = [
    { x: 100, z: 0 },
    { x: 100, z: 80 },
    { x: 60, z: 80 },
    { x: 60, z: 40 },
    { x: 50, z: 40 },
  ];

  it('moves the center to each new one during the shrink', () => {
    const m = schedule()[0]!;
    const half = zoneAt(m.shrink + shrinkSeconds[0]! / 2, centers);
    expect(half.center.x).toBeCloseTo(50);
    expect(half.center.z).toBeCloseTo(0);
    expect(zoneAt(m.end + 0.001, centers).center).toEqual(centers[0]);
  });

  it('reaches every center after its shrink, and the last one at the end', () => {
    for (const [i, m] of schedule().entries()) {
      const c = zoneAt(m.end + 0.001, centers).center;
      expect(c.x).toBeCloseTo(centers[i]!.x, 1);
      expect(c.z).toBeCloseTo(centers[i]!.z, 1);
    }
  });

  it('keeps the center steady during a wait', () => {
    const m = schedule()[1]!;
    expect(zoneAt(m.wait + 5, centers).center).toEqual(centers[0]);
  });
});

describe('Zone', () => {
  it('advances with simulated time', () => {
    const zone = new Zone();
    expect(zone.state.stage).toBe('wait');
    zone.update(waitSeconds[0]! + 1);
    expect(zone.state).toMatchObject({ phase: 1, stage: 'shrink' });
    expect(zone.time).toBe(waitSeconds[0]! + 1);
  });

  it('gives the same answer in small steps as in one big one', () => {
    const steps = new Zone();
    for (let i = 0; i < 1000; i++) steps.update(0.5);
    const jump = new Zone();
    jump.update(500);
    expect(steps.state.radius).toBeCloseTo(jump.state.radius, 6);
    expect(steps.state.phase).toBe(jump.state.phase);
  });

  it('plays all 5 phases to the end', () => {
    const zone = new Zone();
    const phases = new Set<number>();
    for (let t = 0; t < zoneDuration() + 5; t += 1) {
      zone.update(1);
      phases.add(zone.state.phase);
    }
    expect([...phases]).toEqual([1, 2, 3, 4, 5]);
    expect(zone.state.stage).toBe('done');
  });
});
