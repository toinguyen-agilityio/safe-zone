import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Health } from './health';
import { Inventory } from './inventory';
import { carryLimit, ITEM_TYPES, itemAmount, stockOf } from './items';

const setup = () => {
  const health = new Health();
  return { health, bag: new Inventory(health) };
};

describe('items', () => {
  it('knows the four item types and the limits from the config', () => {
    expect(ITEM_TYPES).toEqual(['banhMi', 'sugarcaneJuice', 'ammoBox', 'raincoat']);
    expect(carryLimit('banhMi')).toBe(5);
    expect(carryLimit('sugarcaneJuice')).toBe(3);
    expect(carryLimit('ammo')).toBe(180);
  });

  it('maps items to stocks, and a raincoat to none', () => {
    expect(stockOf('ammoBox')).toBe('ammo');
    expect(stockOf('banhMi')).toBe('banhMi');
    expect(stockOf('raincoat')).toBeNull();
    expect(itemAmount('ammoBox')).toBe(config.loot.ammoBoxAmount);
  });
});

describe('Inventory heals', () => {
  it.each([
    ['banhMi', 5],
    ['sugarcaneJuice', 3],
  ] as const)('takes %s up to its limit of %i and then refuses', (item, limit) => {
    const { bag } = setup();
    for (let i = 0; i < limit - 1; i++) expect(bag.addItem(item)).toBe(true);
    // Below the limit, then exactly at it, then above it.
    expect(bag.count(item)).toBe(limit - 1);
    expect(bag.addItem(item)).toBe(true);
    expect(bag.count(item)).toBe(limit);
    expect(bag.addItem(item)).toBe(false);
    expect(bag.count(item)).toBe(limit);
  });
});

describe('Inventory ammo', () => {
  it('adds a box of rounds', () => {
    const { bag } = setup();
    expect(bag.addItem('ammoBox')).toBe(true);
    expect(bag.count('ammo')).toBe(30);
  });

  it('takes boxes up to 180 rounds and refuses more', () => {
    const { bag } = setup();
    for (let i = 0; i < 6; i++) expect(bag.addItem('ammoBox')).toBe(true);
    expect(bag.count('ammo')).toBe(180);
    expect(bag.addItem('ammoBox')).toBe(false);
    expect(bag.count('ammo')).toBe(180);
  });

  it('adds only what fits from the last box', () => {
    const { bag } = setup();
    for (let i = 0; i < 5; i++) bag.addItem('ammoBox');
    bag.take('ammo', 10);
    expect(bag.count('ammo')).toBe(140);
    expect(bag.addItem('ammoBox')).toBe(true);
    expect(bag.addItem('ammoBox')).toBe(true);
    expect(bag.count('ammo')).toBe(180);
  });
});

describe('Inventory raincoat', () => {
  it('restores armor through the health model', () => {
    const { bag, health } = setup();
    expect(bag.addItem('raincoat')).toBe(true);
    expect(health.armor).toBe(60);
  });

  it('only tops up armor that was worn down, never past 60', () => {
    const { bag, health } = setup();
    health.addArmor(60);
    health.damage(40, 'gun');
    expect(health.armor).toBeLessThan(60);
    expect(bag.addItem('raincoat')).toBe(true);
    expect(health.armor).toBe(60);
  });

  it('is refused while armor is already full', () => {
    const { bag, health } = setup();
    health.addArmor(60);
    expect(bag.addItem('raincoat')).toBe(false);
  });
});

describe('Inventory take', () => {
  it('spends from the stock and refuses when there is not enough', () => {
    const { bag } = setup();
    bag.addItem('banhMi');
    expect(bag.take('banhMi')).toBe(true);
    expect(bag.take('banhMi')).toBe(false);
    expect(bag.count('banhMi')).toBe(0);
  });
});
