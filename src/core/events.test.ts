import { describe, expect, it } from 'vitest';
import { EventBus } from './events';

declare module './events' {
  interface EventMap {
    ping: number;
    pong: string;
  }
}

describe('EventBus', () => {
  it('delivers a typed payload to a listener', () => {
    const bus = new EventBus();
    const received: number[] = [];
    bus.on('ping', (n) => received.push(n));
    bus.emit('ping', 7);
    expect(received).toEqual([7]);
  });

  it('stops delivering after unsubscribe', () => {
    const bus = new EventBus();
    let calls = 0;
    const unsubscribe = bus.on('ping', () => calls++);
    bus.emit('ping', 1);
    unsubscribe();
    bus.emit('ping', 2);
    expect(calls).toBe(1);
  });

  it('calls every listener and only for its own event', () => {
    const bus = new EventBus();
    const log: string[] = [];
    bus.on('ping', () => log.push('a'));
    bus.on('ping', () => log.push('b'));
    bus.on('pong', () => log.push('c'));
    bus.emit('ping', 1);
    expect(log).toEqual(['a', 'b']);
  });

  it('supports off() with the same listener', () => {
    const bus = new EventBus();
    let calls = 0;
    const listener = () => calls++;
    bus.on('pong', listener);
    bus.off('pong', listener);
    bus.emit('pong', 'x');
    expect(calls).toBe(0);
  });
});
