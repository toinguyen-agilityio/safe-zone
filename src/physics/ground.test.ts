import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { getBridges } from '../world/bridges';
import { getLayout, riverCenterX } from '../world/layout';
import { createGroundHeight } from './ground';

const layout = getLayout();
const groundHeight = createGroundHeight(layout);
const bridge = getBridges(layout).find((b) => b.id === 'dragon')!;
const bed = -config.world.river.bedDepth;
const deck = bridge.deckHeight;
const midRiver = riverCenterX(bridge.z);
const road = config.world.roadLevel;

describe('land and river', () => {
  it('is road level on land', () => {
    expect(groundHeight(0, 0, 0)).toBe(road);
    expect(groundHeight(-200, 150, 0)).toBe(road);
  });

  it('is the river bed in the river, away from the bridges', () => {
    const z = -40;
    expect(groundHeight(riverCenterX(z), z, 0)).toBe(bed);
    expect(groundHeight(riverCenterX(z) + 20, z, bed)).toBe(bed);
  });

  it('is road level on the far bank, east of the river', () => {
    const z = -40;
    expect(groundHeight(riverCenterX(z) + 40, z, 0)).toBe(road);
  });
});

describe('bridge ramps and deck', () => {
  it('rises along the west ramp from road level to deck height', () => {
    const start = groundHeight(bridge.rampStartX + 0.01, bridge.z, 0);
    const middle = groundHeight((bridge.rampStartX + bridge.deckStartX) / 2, bridge.z, deck / 2);
    const top = groundHeight(bridge.deckStartX, bridge.z, deck - 0.1);
    expect(start).toBeCloseTo(0, 1);
    expect(middle).toBeCloseTo(deck / 2);
    expect(top).toBeCloseTo(deck);
  });

  it('is the deck height over the river for someone standing on it', () => {
    expect(groundHeight(midRiver, bridge.z, deck)).toBe(deck);
    expect(groundHeight(midRiver + 5, bridge.z + 3, deck + 0.3)).toBe(deck);
  });

  it('falls along the east ramp back to road level', () => {
    const middle = groundHeight((bridge.deckEndX + bridge.rampEndX) / 2, bridge.z, deck / 2);
    expect(middle).toBeCloseTo(deck / 2);
    expect(groundHeight(bridge.rampEndX - 0.01, bridge.z, 0.1)).toBeCloseTo(0, 1);
  });

  it('keeps the player on the surface while walking up a ramp in small steps', () => {
    let y = 0;
    for (let x = bridge.rampStartX; x <= bridge.deckEndX; x += 0.5) {
      y = groundHeight(x, bridge.z, y);
    }
    expect(y).toBe(deck);
  });

  it('ignores the bridge beside the deck', () => {
    expect(groundHeight(midRiver, bridge.z + bridge.deckWidth / 2 + 2, bed)).toBe(bed);
    expect(groundHeight(midRiver, bridge.z - bridge.deckWidth / 2 - 2, bed)).toBe(bed);
  });
});

describe('under the bridge', () => {
  it('is the river bed for someone under the deck', () => {
    expect(groundHeight(midRiver, bridge.z, bed)).toBe(bed);
    expect(groundHeight(midRiver, bridge.z, bed + 1)).toBe(bed);
    expect(groundHeight(midRiver, bridge.z, 0)).toBe(bed);
  });

  it('is the river bed for someone swimming under the deck near the ramp', () => {
    expect(groundHeight(bridge.deckStartX + 3, bridge.z, bed)).toBe(bed);
  });
});
