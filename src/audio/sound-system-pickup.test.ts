import { describe, expect, it } from 'vitest';
import { EventBus } from '../core/events';
import { connectSounds } from './sound-system';

const item = { id: 1, type: 'banhMi' as const, x: 0, z: 0 };

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

describe('pickup sound', () => {
  it('plays when the player picks up an item', () => {
    const { events, log } = setup();
    events.emit('pickup', { item, collector: 'player' });
    expect(log).toEqual(['pickup']);
  });

  it('stays quiet when someone else picks up', () => {
    const { events, log } = setup();
    events.emit('pickup', { item, collector: 'bot-1' });
    expect(log).toEqual([]);
  });

  it('stops after disconnect', () => {
    const { events, log, stop } = setup();
    stop();
    events.emit('pickup', { item, collector: 'player' });
    expect(log).toEqual([]);
  });
});
