import { describe, expect, it } from 'vitest';
import { EventBus } from '../core/events';
import type { HitEvent } from '../systems/shot';
import { connectSounds } from './sound-system';

const shot = { origin: { x: 0, y: 1, z: 0 }, direction: { x: 0, y: 0, z: -1 } };
const hit = (shooter: string | null): HitEvent => ({
  target: 'bot-1',
  region: 'torso',
  damage: 25,
  distance: 10,
  shooter,
  origin: shot.origin,
});

function setup() {
  const events = new EventBus();
  const log: string[] = [];
  const stop = connectSounds(events, {
    playShot: () => log.push('shot'),
    playHit: () => log.push('hit'),
    playPickup: () => log.push('pickup'),
  });
  return { events, log, stop };
}

describe('connectSounds', () => {
  it('plays the shot sound for each shot', () => {
    const { events, log } = setup();
    events.emit('shot', shot);
    events.emit('shot', shot);
    expect(log).toEqual(['shot', 'shot']);
  });

  it('plays the hit sound when the player hits a target', () => {
    const { events, log } = setup();
    events.emit('hit', hit('player'));
    expect(log).toEqual(['hit']);
  });

  it('stays quiet for hits by others', () => {
    const { events, log } = setup();
    events.emit('hit', hit('bot-2'));
    events.emit('hit', hit(null));
    expect(log).toEqual([]);
  });

  it('stops listening when disconnected', () => {
    const { events, log, stop } = setup();
    stop();
    events.emit('shot', shot);
    events.emit('hit', hit('player'));
    expect(log).toEqual([]);
  });

  it('plays nothing with the real sounds before the first click', () => {
    const events = new EventBus();
    connectSounds(events);
    expect(() => {
      events.emit('shot', shot);
      events.emit('hit', hit('player'));
    }).not.toThrow();
  });
});
