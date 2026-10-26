import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Health } from '../entities/health';
import { applyZoneDamage, zoneDamage, zoneDps } from './zone-damage';

describe('zoneDps', () => {
  it('starts at 1 per second in phase 1 and ends at 12 in phase 5', () => {
    expect(zoneDps(1)).toBe(config.zone.drainStart);
    expect(zoneDps(5)).toBe(config.zone.drainEnd);
  });

  it('rises with every phase', () => {
    for (let phase = 1; phase < 5; phase++) {
      expect(zoneDps(phase + 1)).toBeGreaterThan(zoneDps(phase));
    }
  });

  it('keeps the values in the config', () => {
    expect([1, 2, 3, 4, 5].map(zoneDps)).toEqual([...config.zone.drainPerSecond]);
  });

  it('clamps a phase outside 1 to 5', () => {
    expect(zoneDps(0)).toBe(zoneDps(1));
    expect(zoneDps(9)).toBe(zoneDps(5));
  });
});

describe('zoneDamage', () => {
  it('is nothing inside the dry zone', () => {
    for (let phase = 1; phase <= 5; phase++) expect(zoneDamage(phase, 10, false)).toBe(0);
  });

  it('is the per second rate times the time outside it', () => {
    expect(zoneDamage(1, 10, true)).toBe(10);
    expect(zoneDamage(3, 2, true)).toBe(12);
    expect(zoneDamage(5, 0.5, true)).toBe(6);
  });

  it('is nothing for no time', () => {
    expect(zoneDamage(5, 0, true)).toBe(0);
    expect(zoneDamage(5, -1, true)).toBe(0);
  });
});

describe('applyZoneDamage', () => {
  it('removes the expected total over simulated time outside the zone', () => {
    const health = new Health();
    for (let i = 0; i < 100; i++) applyZoneDamage(health, 2, 0.1, true);
    expect(health.health).toBeCloseTo(100 - 10 * config.zone.drainPerSecond[1]!, 6);
  });

  it('takes nothing inside the zone', () => {
    const health = new Health();
    expect(applyZoneDamage(health, 5, 10, false)).toBeNull();
    expect(health.health).toBe(100);
  });

  it('is not softened by armor', () => {
    const health = new Health();
    health.addArmor(60);
    applyZoneDamage(health, 5, 1, true);
    expect(health.health).toBe(100 - config.zone.drainEnd);
    expect(health.armor).toBe(60);
  });

  it('can kill, and reports the kill once', () => {
    const health = new Health();
    let kills = 0;
    for (let t = 0; t < 20; t++) {
      if (applyZoneDamage(health, 5, 1, true)?.killed) kills++;
    }
    expect(health.dead).toBe(true);
    expect(kills).toBe(1);
  });
});
