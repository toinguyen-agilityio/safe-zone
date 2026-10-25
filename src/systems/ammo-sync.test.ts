import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Health } from '../entities/health';
import { Inventory } from '../entities/inventory';
import { Weapon } from '../entities/weapon';
import { AmmoSync } from './ammo-sync';

function setup() {
  const weapon = new Weapon();
  const inventory = new Inventory(new Health());
  const sync = new AmmoSync(weapon, inventory);
  return { weapon, inventory, sync };
}

const carrier = { swimming: false, parachuting: false, sprinting: false };

describe('AmmoSync', () => {
  it('carries the starting rounds in the bag', () => {
    const { inventory, weapon } = setup();
    expect(inventory.count('ammo')).toBe(config.combat.startingReserve);
    expect(weapon.reserve).toBe(config.combat.startingReserve);
  });

  it('adds a picked up ammo box to the rifle reserve', () => {
    const { inventory, weapon, sync } = setup();
    inventory.addItem('ammoBox');
    sync.update();
    expect(weapon.reserve).toBe(config.combat.startingReserve + config.loot.ammoBoxAmount);
  });

  it('stops at the carry limit of 180', () => {
    const { inventory, weapon, sync } = setup();
    for (let i = 0; i < 10; i++) inventory.addItem('ammoBox');
    sync.update();
    expect(weapon.reserve).toBe(config.loot.carryLimit.ammo);
    expect(inventory.addItem('ammoBox')).toBe(false);
  });

  it('takes rounds out of the bag when the rifle reloads', () => {
    const { inventory, weapon, sync } = setup();
    for (let i = 0; i < 10; i++) weapon.update(0.1, { fire: true, reload: false }, carrier);
    const fired = config.combat.magazineSize - weapon.magazine;
    expect(fired).toBeGreaterThanOrEqual(10);
    // Reloading moves exactly the rounds that were fired from the reserve into the magazine.
    weapon.update(0.1, { fire: false, reload: true }, carrier);
    weapon.update(config.combat.reloadSeconds + 0.1, { fire: false, reload: false }, carrier);
    sync.update();
    expect(weapon.reserve).toBe(config.combat.startingReserve - fired);
    expect(inventory.count('ammo')).toBe(weapon.reserve);
  });

  it('keeps both numbers equal through picking up and reloading', () => {
    const { inventory, weapon, sync } = setup();
    for (let round = 0; round < 3; round++) {
      inventory.addItem('ammoBox');
      for (let i = 0; i < 12; i++) weapon.update(0.1, { fire: true, reload: false }, carrier);
      weapon.update(0.1, { fire: false, reload: true }, carrier);
      weapon.update(config.combat.reloadSeconds + 0.1, { fire: false, reload: false }, carrier);
      sync.update();
      expect(inventory.count('ammo')).toBe(weapon.reserve);
    }
  });
});

describe('Inventory.give', () => {
  it('adds up to the carry limit and says how many fit', () => {
    const inventory = new Inventory(new Health());
    expect(inventory.give('ammo', 100)).toBe(100);
    expect(inventory.give('ammo', 100)).toBe(80);
    expect(inventory.give('ammo', 5)).toBe(0);
    expect(inventory.give('ammo', -5)).toBe(0);
    expect(inventory.count('ammo')).toBe(180);
  });
});
