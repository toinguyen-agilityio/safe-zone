import { describe, expect, it } from 'vitest';
import { GameLoop } from './loop';

const setup = (maxDt = 0.05) => {
  const steps: number[] = [];
  let renders = 0;
  const loop = new GameLoop({
    maxDt,
    update: (dt) => steps.push(dt),
    render: () => renders++,
  });
  return { loop, steps, renders: () => renders };
};

describe('GameLoop', () => {
  it('uses a zero step on the first tick', () => {
    const { loop, steps } = setup();
    loop.tick(1000);
    expect(steps).toEqual([0]);
  });

  it('passes the real step when it is below the cap', () => {
    const { loop, steps } = setup();
    loop.tick(1000);
    loop.tick(1016);
    expect(steps[1]).toBeCloseTo(0.016);
  });

  it('caps a 5 s gap to one capped step', () => {
    const { loop, steps } = setup();
    loop.tick(1000);
    loop.tick(6000);
    expect(steps).toEqual([0, 0.05]);
  });

  it('resumes without a time jump after resetClock', () => {
    const { loop, steps } = setup();
    loop.tick(1000);
    loop.resetClock();
    loop.tick(9000);
    expect(steps).toEqual([0, 0]);
  });

  it('renders once per tick', () => {
    const { loop, renders } = setup();
    loop.tick(0);
    loop.tick(16);
    expect(renders()).toBe(2);
  });
});
