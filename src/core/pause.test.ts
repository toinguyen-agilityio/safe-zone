import { describe, expect, it } from 'vitest';
import { GameLoop } from './loop';
import { Pause, runUpdates } from './pause';

describe('Pause', () => {
  it('starts running and can be paused, resumed and toggled', () => {
    const pause = new Pause();
    expect(pause.paused).toBe(false);
    pause.pause();
    expect(pause.paused).toBe(true);
    pause.resume();
    expect(pause.paused).toBe(false);
    expect(pause.toggle()).toBe(true);
    expect(pause.toggle()).toBe(false);
  });
});

describe('runUpdates', () => {
  it('runs every update with the time step while running', () => {
    const seen: number[] = [];
    const updates = [(dt: number) => seen.push(dt), (dt: number) => seen.push(dt * 2)];
    expect(runUpdates(updates, 0.016, new Pause())).toBe(2);
    expect(seen).toEqual([0.016, 0.032]);
  });

  it('runs nothing while paused', () => {
    const pause = new Pause();
    pause.pause();
    let calls = 0;
    expect(runUpdates([() => calls++], 0.016, pause)).toBe(0);
    expect(calls).toBe(0);
  });

  it('continues from the same state after resuming, with no time jump', () => {
    const pause = new Pause();
    let simulated = 0;
    let renders = 0;
    const updates = [(dt: number) => (simulated += dt)];
    const loop = new GameLoop({
      maxDt: 0.05,
      update: (dt) => runUpdates(updates, dt, pause),
      render: () => renders++,
    });

    loop.tick(0);
    loop.tick(16);
    const before = simulated;

    pause.pause();
    let now = 16;
    while (now < 5000) loop.tick((now += 16)); // about five seconds of paused frames
    expect(simulated).toBe(before);
    expect(renders).toBeGreaterThan(100);

    pause.resume();
    loop.tick(now + 16);
    expect(simulated - before).toBeCloseTo(0.016);
  });
});
