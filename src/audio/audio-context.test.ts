import { afterEach, describe, expect, it } from 'vitest';
import { getAudio, installAudio, resetAudio, type AudioLike } from './audio-context';

class FakeTarget {
  private readonly listeners = new Set<() => void>();
  addEventListener(_type: string, listener: () => void): void {
    this.listeners.add(listener);
  }
  removeEventListener(_type: string, listener: () => void): void {
    this.listeners.delete(listener);
  }
  click(): void {
    for (const listener of [...this.listeners]) listener();
  }
  get waiting(): number {
    return this.listeners.size;
  }
}

function fakeFactory(state = 'suspended') {
  const made: (AudioLike & { resumed: number })[] = [];
  const factory = () => {
    const ctx = {
      state,
      resumed: 0,
      resume() {
        this.resumed++;
        this.state = 'running';
        return Promise.resolve();
      },
    };
    made.push(ctx);
    return ctx;
  };
  return { factory, made };
}

afterEach(resetAudio);

describe('audio context', () => {
  it('does not exist before the first click', () => {
    const target = new FakeTarget();
    const { factory, made } = fakeFactory();
    installAudio(target, factory);
    expect(getAudio()).toBeNull();
    expect(made).toHaveLength(0);
  });

  it('is created and running after the first click', () => {
    const target = new FakeTarget();
    const { factory, made } = fakeFactory();
    installAudio(target, factory);
    target.click();
    expect(made).toHaveLength(1);
    expect(getAudio()).toBe(made[0]);
    expect(getAudio()?.state).toBe('running');
  });

  it('is created only once, however many clicks', () => {
    const target = new FakeTarget();
    const { factory, made } = fakeFactory();
    installAudio(target, factory);
    target.click();
    target.click();
    expect(made).toHaveLength(1);
    expect(target.waiting).toBe(0);
  });

  it('does not resume a context that already runs', () => {
    const target = new FakeTarget();
    const { factory, made } = fakeFactory('running');
    installAudio(target, factory);
    target.click();
    expect(made[0]?.resumed).toBe(0);
  });

  it('ignores a second install', () => {
    const target = new FakeTarget();
    const { factory, made } = fakeFactory();
    installAudio(target, factory);
    installAudio(target, factory);
    expect(target.waiting).toBe(1);
    target.click();
    installAudio(target, factory);
    target.click();
    expect(made).toHaveLength(1);
  });
});
