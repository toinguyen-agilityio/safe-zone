import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { getBridges } from './bridges';
import { getLayout, riverCenterX } from './layout';

const layout = getLayout();
const bridges = getBridges(layout);
const halfRiver = layout.river.width / 2;
const { waterLevel, bedDepth } = config.world.river;

describe('getBridges', () => {
  it('returns the three named bridges', () => {
    expect(bridges.map((b) => b.name).sort()).toEqual([
      'Dragon Bridge',
      'Han River Bridge',
      'Tran Thi Ly Bridge',
    ]);
  });

  it('keeps every deck above the water', () => {
    for (const bridge of bridges) expect(bridge.deckHeight).toBeGreaterThan(waterLevel);
  });

  it('has ramps that join the bank to the deck', () => {
    for (const bridge of bridges) {
      const bank = riverCenterX(bridge.z) - halfRiver;
      // The west ramp ends where the deck starts, which is the river bank.
      expect(bridge.deckStartX).toBeCloseTo(bank);
      expect(bridge.deckStartX - bridge.rampStartX).toBeCloseTo(bridge.rampLength);
      expect(bridge.rampEndX - bridge.deckEndX).toBeCloseTo(bridge.rampLength);
      expect(bridge.deckEndX).toBeCloseTo(riverCenterX(bridge.z) + halfRiver);
    }
  });

  it('stands pillars inside the river from the bed up to the deck', () => {
    for (const bridge of bridges) {
      expect(bridge.pillars.length).toBeGreaterThan(0);
      for (const pillar of bridge.pillars) {
        expect(pillar.x).toBeGreaterThan(bridge.deckStartX);
        expect(pillar.x).toBeLessThan(bridge.deckEndX);
        expect(pillar.bottomY).toBe(-bedDepth);
        expect(pillar.topY).toBe(bridge.deckHeight);
      }
    }
  });

  it('puts one railing along each side of the deck', () => {
    for (const bridge of bridges) {
      expect(bridge.railings).toHaveLength(2);
      const zs = bridge.railings.map((r) => r.z).sort((a, b) => a - b);
      expect(zs[1]! - zs[0]!).toBeCloseTo(bridge.deckWidth);
      for (const railing of bridge.railings) {
        expect(railing.x0).toBe(bridge.rampStartX);
        expect(railing.x1).toBe(bridge.rampEndX);
      }
    }
  });
});
