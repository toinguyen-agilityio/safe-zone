import { describe, expect, it } from 'vitest';
import { config } from '../../config';
import { Health } from '../../entities/health';
import { Inventory } from '../../entities/inventory';
import { Weapon } from '../../entities/weapon';
import { ammoView } from './hud-ammo';

const carrier = { swimming: false, parachuting: false, sprinting: false };

describe('ammoView', () => {
  it('shows a full magazine, the reserve and no items for a new player', () => {
    const view = ammoView(new Weapon(), new Inventory(new Health()));
    expect(view).toMatchObject({
      magazine: '30',
      reserve: `${config.combat.startingReserve}`,
      state: '',
      empty: false,
      banhMi: '0/5',
      juice: '0/3',
    });
  });

  it('uses Vietnamese labels', () => {
    const view = ammoView(new Weapon(), new Inventory(new Health()));
    expect(view.banhMiLabel).toBe('1 Bánh mì');
    expect(view.juiceLabel).toBe('2 Nước mía');
  });

  it('updates when firing', () => {
    const weapon = new Weapon();
    const inventory = new Inventory(new Health());
    for (let i = 0; i < 5; i++) weapon.update(0.1, { fire: true, reload: false }, carrier);
    const view = ammoView(weapon, inventory);
    expect(view.magazine).toBe(`${weapon.magazine}`);
    expect(weapon.magazine).toBeLessThan(config.combat.magazineSize);
  });

  it('says when it is reloading', () => {
    const weapon = new Weapon();
    const inventory = new Inventory(new Health());
    weapon.update(0.1, { fire: true, reload: false }, carrier);
    weapon.update(0.1, { fire: false, reload: true }, carrier);
    expect(ammoView(weapon, inventory).state).toContain('nạp đạn');
  });

  it('updates the reserve and item counts when picking up', () => {
    const weapon = new Weapon();
    const inventory = new Inventory(new Health());
    inventory.addItem('banhMi');
    inventory.addItem('banhMi');
    inventory.addItem('sugarcaneJuice');
    weapon.reserve = 120;
    const view = ammoView(weapon, inventory);
    expect(view.banhMi).toBe('2/5');
    expect(view.juice).toBe('1/3');
    expect(view.reserve).toBe('120');
  });

  it('warns when there is no ammo left at all', () => {
    const weapon = new Weapon(0);
    weapon.magazine = 0;
    const view = ammoView(weapon, new Inventory(new Health()));
    expect(view.empty).toBe(true);
    expect(view.state).toBe('Hết đạn');
  });
});
