import { describe, expect, it } from 'vitest';
import { Health } from '../../entities/health';
import { LOW_HEALTH, vitalsView } from './hud-vitals';

describe('vitalsView', () => {
  it('shows full health and no armor for a new player, in Vietnamese', () => {
    const view = vitalsView(new Health());
    expect(view).toMatchObject({
      healthLabel: 'Máu',
      healthText: '100',
      healthPercent: 100,
      armorLabel: 'Giáp',
      armorText: '0',
      armorPercent: 0,
      low: false,
    });
  });

  it('updates when health changes', () => {
    const h = new Health();
    h.damage(35, 'gun');
    const view = vitalsView(h);
    expect(view.healthText).toBe('65');
    expect(view.healthPercent).toBe(65);
  });

  it('shows armor as a share of the 60 points', () => {
    const h = new Health();
    h.addArmor(60);
    expect(vitalsView(h)).toMatchObject({ armorText: '60', armorPercent: 100 });
    h.damage(40, 'gun');
    const view = vitalsView(h);
    expect(view.armorPercent).toBeLessThan(100);
    expect(view.armorPercent).toBeGreaterThan(0);
    expect(Number(view.armorText)).toBeLessThan(60);
  });

  it('rounds up so a sliver of health does not read as zero', () => {
    expect(vitalsView({ health: 0.2, armor: 0.4 })).toMatchObject({
      healthText: '1',
      armorText: '1',
    });
  });

  it('warns at low health', () => {
    expect(vitalsView({ health: LOW_HEALTH, armor: 0 }).low).toBe(true);
    expect(vitalsView({ health: LOW_HEALTH + 1, armor: 0 }).low).toBe(false);
  });

  it('never shows negative numbers or a bar past full', () => {
    const view = vitalsView({ health: -5, armor: 500 });
    expect(view.healthText).toBe('0');
    expect(view.healthPercent).toBe(0);
    expect(view.armorPercent).toBe(100);
  });
});
