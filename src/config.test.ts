import { describe, expect, it } from 'vitest';
import { config } from './config';

describe('config', () => {
  it('defines world values', () => {
    expect(config.world.mapSize).toBe(640);
    expect(typeof config.world.defaultSeed).toBe('number');
    expect(config.world.maxDt).toBe(0.05);
    expect(config.world.gridCellSize).toBeGreaterThan(0);
    expect(config.world.river.bedDepth).toBeGreaterThan(0);
    expect(config.world.river.waterLevel).toBeLessThan(0);
  });

  it('defines player values', () => {
    expect(config.player).toEqual({
      health: 100,
      armorMax: 60,
      armorBlock: 0.45,
      parachuteStartHeight: 75,
      radius: 0.4,
      eyeHeight: 1.7,
      spawn: { x: 0, z: 0 },
      walkSpeed: 5,
      lookSensitivity: 0.0022,
      pitchLimitDegrees: 85,
    });
  });

  it('defines combat values', () => {
    expect(config.combat).toEqual({
      magazineSize: 30,
      reloadSeconds: 1.8,
      headMultiplier: 2,
    });
  });

  it('defines bot and ui values', () => {
    expect(config.bots.count).toBe(19);
    expect(config.ui.killFeedMax).toBe(5);
  });

  it('defines zone values', () => {
    expect(config.zone.radii).toEqual([230, 130, 68, 30, 6]);
    expect(config.zone.drainStart).toBe(1);
    expect(config.zone.drainEnd).toBe(12);
    expect(config.zone.waitSeconds).toHaveLength(5);
    expect(config.zone.shrinkSeconds).toHaveLength(5);
  });

  it('defines loot values', () => {
    expect(config.loot.itemCount).toBe(150);
    expect(config.loot.carryLimit).toEqual({ banhMi: 5, sugarcaneJuice: 3, ammo: 180 });
    expect(config.loot.banhMi).toEqual({ healAmount: 30, healSeconds: 2 });
    expect(config.loot.sugarcaneJuice).toEqual({
      healAmount: 15,
      healSeconds: 1.2,
      buffSeconds: 8,
    });
  });
});
