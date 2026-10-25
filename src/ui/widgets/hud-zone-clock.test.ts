import { describe, expect, it } from 'vitest';
import { config } from '../../config';
import { EventBus } from '../../core/events';
import { ZoneSystem } from '../../systems/zone-system';
import { clockView } from './hud-zone-clock';

describe('clockView', () => {
  it('counts down to the shrink while waiting, in m:ss', () => {
    const view = clockView({ phase: 1, stage: 'wait', stageLeft: 65 });
    expect(view.time).toBe('1:05');
    expect(view.label).toContain('nước dâng');
    expect(view.shrinking).toBe(false);
  });

  it('counts down to the end of the shrink while shrinking', () => {
    const view = clockView({ phase: 2, stage: 'shrink', stageLeft: 20 });
    expect(view.time).toBe('0:20');
    expect(view.label).toContain('thu hẹp');
    expect(view.shrinking).toBe(true);
  });

  it('names the phase', () => {
    expect(clockView({ phase: 3, stage: 'wait', stageLeft: 10 }).label).toContain('3');
  });

  it('stops at the last zone', () => {
    expect(clockView({ phase: 5, stage: 'done', stageLeft: 0 })).toMatchObject({
      time: '0:00',
      shrinking: false,
    });
  });

  it('follows the real zone: the full wait at the start, then less each second', () => {
    const zone = new ZoneSystem(new EventBus(), 1);
    expect(clockView(zone).time).toBe('1:00');
    zone.update(1);
    expect(clockView(zone).time).toBe('0:59');
    zone.update(config.zone.waitSeconds[0]! - 1);
    expect(clockView(zone)).toMatchObject({ time: '0:45', shrinking: true });
  });
});
