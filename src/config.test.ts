import { describe, expect, it } from 'vitest';
import { config } from './config';

describe('config', () => {
  it('defines world values', () => {
    expect(config.world.mapSize).toBe(640);
    expect(typeof config.world.defaultSeed).toBe('number');
  });

  it('defines player values', () => {
    expect(config.player).toEqual({
      health: 100,
      armorMax: 60,
      armorBlock: 0.45,
      parachuteStartHeight: 75,
    });
  });

  it('defines combat values', () => {
    expect(config.combat).toEqual({
      magazineSize: 30,
      reloadSeconds: 1.8,
      headMultiplier: 2,
    });
  });
});
