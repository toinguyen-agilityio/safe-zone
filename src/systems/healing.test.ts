import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Health } from '../entities/health';
import { Inventory } from '../entities/inventory';
import { Healing } from './healing';

const { banhMi, sugarcaneJuice } = config.loot;
const dt = 0.1;

function setup(damage = 60) {
  const health = new Health();
  health.damage(damage, 'flood');
  const inventory = new Inventory(health);
  for (let i = 0; i < 3; i++) {
    inventory.addItem('banhMi');
    inventory.addItem('sugarcaneJuice');
  }
  return { health, inventory, healing: new Healing(health, inventory) };
}

/** Run simulated seconds; returns the result of the update that finished a heal, if any. */
function run(healing: Healing, seconds: number) {
  let result = null;
  for (let i = 0; i < Math.round(seconds / dt); i++) {
    const r = healing.update(dt);
    if (r) result = r;
  }
  return result;
}

describe('eating banh mi', () => {
  it('heals 30 after 2 seconds and uses one', () => {
    const { health, inventory, healing } = setup();
    expect(healing.start('banhMi')).toBe(true);
    expect(healing.state).toBe('banhMi');
    run(healing, banhMi.healSeconds - 0.3);
    expect(health.health).toBe(40);
    expect(inventory.count('banhMi')).toBe(3);

    const result = run(healing, 0.5);
    expect(result).toEqual({ item: 'banhMi', healed: 30 });
    expect(health.health).toBe(70);
    expect(inventory.count('banhMi')).toBe(2);
    expect(healing.state).toBe('idle');
  });

  it('has no speed buff', () => {
    const { healing } = setup();
    healing.start('banhMi');
    run(healing, 3);
    expect(healing.speedMultiplier).toBe(1);
  });

  it('reports progress while eating', () => {
    const { healing } = setup();
    expect(healing.progress).toBe(0);
    healing.start('banhMi');
    run(healing, banhMi.healSeconds / 2);
    expect(healing.progress).toBeCloseTo(0.5, 1);
  });
});

describe('drinking sugarcane juice', () => {
  it('heals 15 after 1.2 seconds, uses one and gives a speed buff for 8 seconds', () => {
    const { health, inventory, healing } = setup();
    expect(healing.start('sugarcaneJuice')).toBe(true);
    const result = run(healing, sugarcaneJuice.healSeconds + 0.2);
    expect(result).toEqual({ item: 'sugarcaneJuice', healed: 15 });
    expect(health.health).toBe(55);
    expect(inventory.count('sugarcaneJuice')).toBe(2);

    expect(healing.buffed).toBe(true);
    expect(healing.speedMultiplier).toBe(sugarcaneJuice.buffSpeedMultiplier);
    run(healing, sugarcaneJuice.buffSeconds - 1);
    expect(healing.buffed).toBe(true);
    run(healing, 1.5);
    expect(healing.buffed).toBe(false);
    expect(healing.speedMultiplier).toBe(1);
  });

  it('is quicker than eating', () => {
    expect(sugarcaneJuice.healSeconds).toBeLessThan(banhMi.healSeconds);
  });
});

describe('the health cap', () => {
  it('never goes past 100 and reports what was gained', () => {
    const { health, healing } = setup(10);
    healing.start('banhMi');
    const result = run(healing, 3);
    expect(health.health).toBe(100);
    expect(result).toEqual({ item: 'banhMi', healed: 10 });
  });

  it('refuses to start at full health, so nothing is wasted', () => {
    const { healing, inventory } = setup(0);
    expect(healing.start('banhMi')).toBe(false);
    expect(inventory.count('banhMi')).toBe(3);
  });
});

describe('cancelling', () => {
  it('leaves the item unused and heals nothing', () => {
    const { health, inventory, healing } = setup();
    healing.start('banhMi');
    run(healing, 1);
    healing.cancel();
    expect(healing.state).toBe('idle');
    run(healing, 5);
    expect(health.health).toBe(40);
    expect(inventory.count('banhMi')).toBe(3);
  });

  it('lets the player start again from the beginning', () => {
    const { health, healing } = setup();
    healing.start('banhMi');
    run(healing, 1.5);
    healing.cancel();
    healing.start('banhMi');
    run(healing, 1);
    expect(health.health).toBe(40);
    run(healing, 1.2);
    expect(health.health).toBe(70);
  });
});

describe('what stops a heal from starting', () => {
  it('needs the item in the bag', () => {
    const { healing, inventory } = setup();
    for (let i = 0; i < 3; i++) inventory.take('banhMi');
    expect(healing.start('banhMi')).toBe(false);
    expect(healing.state).toBe('idle');
  });

  it('does one thing at a time', () => {
    const { healing } = setup();
    expect(healing.start('banhMi')).toBe(true);
    expect(healing.start('sugarcaneJuice')).toBe(false);
    expect(healing.state).toBe('banhMi');
  });

  it('does not heal the dead, and dying mid-meal ends it', () => {
    const { health, inventory, healing } = setup();
    healing.start('banhMi');
    run(healing, 1);
    health.damage(500, 'flood');
    run(healing, 3);
    expect(healing.state).toBe('idle');
    expect(health.health).toBe(0);
    expect(inventory.count('banhMi')).toBe(3);
    expect(healing.start('banhMi')).toBe(false);
  });
});

describe('Health.heal', () => {
  it('adds points up to full and nothing for the dead or for nothing', () => {
    const h = new Health();
    h.damage(50, 'flood');
    expect(h.heal(20)).toBe(20);
    expect(h.heal(100)).toBe(30);
    expect(h.health).toBe(100);
    expect(h.heal(-5)).toBe(0);
    h.damage(500, 'flood');
    expect(h.heal(20)).toBe(0);
  });
});
