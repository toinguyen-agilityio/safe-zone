import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { Health } from '../entities/health';
import { Inventory } from '../entities/inventory';
import type { ItemType } from '../entities/items';
import type { LootItem } from '../world/loot-spawn';
import { PickupSystem, type PickupEvent } from './pickup-system';

const item = (id: number, type: ItemType, x: number, z = 0): LootItem => ({ id, type, x, z });

function setup(items: LootItem[]) {
  const events = new EventBus();
  const picked: PickupEvent[] = [];
  events.on('pickup', (p) => picked.push(p));
  const health = new Health();
  const bag = new Inventory(health);
  return { system: new PickupSystem(items, events), bag, health, picked };
}

describe('PickupSystem', () => {
  it('picks up an item the player walks over and removes it from the ground', () => {
    const { system, bag, picked } = setup([item(1, 'banhMi', 10)]);
    expect(system.update({ x: 10, z: 0 }, bag)).toHaveLength(1);
    expect(bag.count('banhMi')).toBe(1);
    expect(system.items).toHaveLength(0);
    expect(picked).toEqual([{ item: item(1, 'banhMi', 10), collector: 'player' }]);
  });

  it('leaves items that are out of reach', () => {
    const { system, bag, picked } = setup([item(1, 'banhMi', 10)]);
    system.update({ x: 10 + config.loot.pickupRadius + 0.5, z: 0 }, bag);
    expect(system.items).toHaveLength(1);
    expect(bag.count('banhMi')).toBe(0);
    expect(picked).toHaveLength(0);
  });

  it('takes several items at once', () => {
    const { system, bag } = setup([item(1, 'banhMi', 0), item(2, 'ammoBox', 1)]);
    system.update({ x: 0.5, z: 0 }, bag);
    expect(bag.count('banhMi')).toBe(1);
    expect(bag.count('ammo')).toBe(30);
    expect(system.items).toHaveLength(0);
  });

  it('leaves an item on the ground when the carry limit is reached', () => {
    const { system, bag, picked } = setup([item(9, 'sugarcaneJuice', 0)]);
    for (let i = 0; i < 3; i++) bag.addItem('sugarcaneJuice');
    system.update({ x: 0, z: 0 }, bag);
    expect(system.items).toHaveLength(1);
    expect(bag.count('sugarcaneJuice')).toBe(3);
    expect(picked).toHaveLength(0);
  });

  it('takes it later once there is room again', () => {
    const { system, bag } = setup([item(9, 'sugarcaneJuice', 0)]);
    for (let i = 0; i < 3; i++) bag.addItem('sugarcaneJuice');
    system.update({ x: 0, z: 0 }, bag);
    bag.take('sugarcaneJuice');
    system.update({ x: 0, z: 0 }, bag);
    expect(system.items).toHaveLength(0);
    expect(bag.count('sugarcaneJuice')).toBe(3);
  });

  it('restores armor when a raincoat is picked up', () => {
    const { system, bag, health } = setup([item(1, 'raincoat', 0)]);
    system.update({ x: 0, z: 0 }, bag);
    expect(health.armor).toBe(60);
    expect(system.items).toHaveLength(0);
  });

  it('leaves a raincoat while armor is full', () => {
    const { system, bag, health } = setup([item(1, 'raincoat', 0)]);
    health.addArmor(60);
    system.update({ x: 0, z: 0 }, bag);
    expect(system.items).toHaveLength(1);
  });
});
