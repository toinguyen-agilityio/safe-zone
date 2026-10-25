import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { ZoneSystem } from '../systems/zone-system';
import { announcement, MESSAGES_VI, type Announcement } from './messages-vi';

/** Vietnamese letters with marks that plain English text would not have. */
const VIETNAMESE = /[ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;

function listen(zone: ZoneSystem, events: EventBus) {
  const heard: Announcement[] = [];
  events.on('announce', (a) => heard.push(a));
  return { heard, zone };
}

describe('Vietnamese messages', () => {
  it('has the water rising and new dry zone messages in Vietnamese', () => {
    expect(MESSAGES_VI.waterRising).toMatch(VIETNAMESE);
    expect(MESSAGES_VI.newDryZone).toMatch(VIETNAMESE);
    expect(MESSAGES_VI.waterRising).not.toBe(MESSAGES_VI.newDryZone);
  });

  it('builds an announcement with its key and text', () => {
    expect(announcement('waterRising')).toEqual({
      key: 'waterRising',
      text: MESSAGES_VI.waterRising,
    });
  });
});

describe('zone announcements', () => {
  it('announces a new dry zone when a phase starts and the water rising when it shrinks', () => {
    const events = new EventBus();
    const { heard, zone } = listen(new ZoneSystem(events, 1), events);
    // The first phase is announced as the match starts, before anyone listens; wait out phase 1.
    zone.update(config.zone.waitSeconds[0]! + 1);
    expect(heard.map((a) => a.key)).toEqual(['waterRising']);
    expect(heard[0]!.text).toBe(MESSAGES_VI.waterRising);

    zone.update(config.zone.shrinkSeconds[0]! + 1);
    expect(heard.map((a) => a.key)).toEqual(['waterRising', 'newDryZone']);
    expect(heard[1]!.text).toBe(MESSAGES_VI.newDryZone);
  });

  it('announces both messages for each of the later phases, in order', () => {
    const events = new EventBus();
    const { heard, zone } = listen(new ZoneSystem(events, 1), events);
    for (let t = 0; t < 600; t++) zone.update(1);
    expect(heard.map((a) => a.key)).toEqual([
      'waterRising',
      'newDryZone',
      'waterRising',
      'newDryZone',
      'waterRising',
      'newDryZone',
      'waterRising',
      'newDryZone',
      'waterRising',
    ]);
  });

  it('says every announcement in Vietnamese', () => {
    const events = new EventBus();
    const { heard, zone } = listen(new ZoneSystem(events, 1), events);
    for (let t = 0; t < 600; t++) zone.update(1);
    expect(heard.length).toBeGreaterThan(0);
    for (const a of heard) expect(a.text).toMatch(VIETNAMESE);
  });

  it('announces the first new dry zone at the start of the match', () => {
    const events = new EventBus();
    const heard: Announcement[] = [];
    events.on('announce', (a) => heard.push(a));
    new ZoneSystem(events, 1);
    expect(heard.map((a) => a.key)).toEqual(['newDryZone']);
  });
});
