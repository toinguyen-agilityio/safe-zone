import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { Health } from './health';

const { armorMax, armorBlock } = config.player;

describe('Health', () => {
  it('starts with full health and no armor', () => {
    const h = new Health();
    expect(h.health).toBe(100);
    expect(h.armor).toBe(0);
    expect(h.dead).toBe(false);
  });

  it('takes the whole hit without armor', () => {
    const h = new Health();
    const result = h.damage(25, 'gun');
    expect(h.health).toBe(75);
    expect(result).toEqual({ health: 25, armor: 0, killed: false });
  });

  it('blocks 45 percent of gun damage with armor and wears the armor down', () => {
    const h = new Health();
    h.addArmor(armorMax);
    const result = h.damage(40, 'gun');
    expect(result.armor).toBeCloseTo(40 * armorBlock);
    expect(h.armor).toBeCloseTo(armorMax - 40 * armorBlock);
    expect(h.health).toBeCloseTo(100 - 40 * (1 - armorBlock));
  });

  it('uses up the armor after 60 points and then takes full damage', () => {
    const h = new Health();
    h.addArmor(armorMax);
    let blocked = 0;
    for (let i = 0; i < 14; i++) blocked += h.damage(10, 'gun').armor;
    expect(blocked).toBeCloseTo(armorMax);
    expect(h.armor).toBeCloseTo(0);
    const before = h.health;
    h.damage(10, 'gun');
    expect(h.health).toBeCloseTo(before - 10);
  });

  it('only blocks what is left when the armor is nearly gone', () => {
    const h = new Health();
    h.addArmor(5);
    h.damage(40, 'gun');
    expect(h.armor).toBe(0);
    expect(h.health).toBe(65);
  });

  it('does not let armor stop flood damage', () => {
    const h = new Health();
    h.addArmor(armorMax);
    h.damage(10, 'flood');
    expect(h.armor).toBe(armorMax);
    expect(h.health).toBe(90);
  });

  it('caps armor at the most that can be carried', () => {
    const h = new Health();
    h.addArmor(50);
    h.addArmor(50);
    expect(h.armor).toBe(armorMax);
  });

  it('dies at 0 health and reports the killing blow once', () => {
    const h = new Health();
    expect(h.damage(90, 'gun').killed).toBe(false);
    const result = h.damage(25, 'gun');
    expect(h.health).toBe(0);
    expect(h.dead).toBe(true);
    expect(result).toEqual({ health: 10, armor: 0, killed: true });
  });

  it('ignores damage to a dead entity', () => {
    const h = new Health();
    h.addArmor(armorMax);
    h.damage(500, 'flood');
    const armor = h.armor;
    expect(h.damage(30, 'gun')).toEqual({ health: 0, armor: 0, killed: false });
    expect(h.health).toBe(0);
    expect(h.armor).toBe(armor);
  });

  it('ignores zero or negative damage', () => {
    const h = new Health();
    h.damage(-10, 'gun');
    expect(h.health).toBe(100);
  });
});
