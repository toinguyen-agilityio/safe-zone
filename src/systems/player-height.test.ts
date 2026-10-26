import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createPlayer, type Player } from '../entities/player';
import { createGroundHeight } from '../physics/ground';
import { getBridges } from '../world/bridges';
import { getLayout, riverCenterX } from '../world/layout';
import { updatePlayerHeight } from './player-height';

const { eyeHeight, climbSpeed, fallSpeed, walkSpeed } = config.player;
const layout = getLayout();
const groundHeight = createGroundHeight(layout);
const bridge = getBridges(layout).find((b) => b.id === 'dragon')!;
const bed = -config.world.river.bedDepth;
const dt = 1 / 60;

const feet = (p: Player) => p.y - eyeHeight;

/** Walk along x at walking speed, updating the height every frame, and record the eye heights. */
const walkAlong = (player: Player, toX: number, frames = 100000) => {
  const heights = [player.y];
  const direction = Math.sign(toX - player.x);
  for (let i = 0; i < frames && Math.abs(toX - player.x) > 1e-9; i++) {
    player.x += Math.min(walkSpeed * dt, Math.abs(toX - player.x)) * direction;
    updatePlayerHeight(player, groundHeight, dt);
    heights.push(player.y);
  }
  return heights;
};

describe('updatePlayerHeight on land', () => {
  it('keeps the eyes at eye height on level ground', () => {
    const player = createPlayer();
    updatePlayerHeight(player, groundHeight, dt);
    expect(player.y).toBe(eyeHeight);
  });
});

describe('ramps', () => {
  it('raises the view smoothly up the west ramp onto the deck, with no jumps', () => {
    const player = { ...createPlayer(), x: bridge.rampStartX - 2, z: bridge.z };
    const heights = walkAlong(player, bridge.deckStartX + 4);
    for (let i = 1; i < heights.length; i++) {
      expect(Math.abs(heights[i]! - heights[i - 1]!)).toBeLessThanOrEqual(climbSpeed * dt + 1e-9);
    }
    // Each frame's rise is small compared with the whole climb, so the view glides.
    const biggestStep = Math.max(...heights.slice(1).map((h, i) => Math.abs(h - heights[i]!)));
    expect(biggestStep).toBeLessThan(0.1);
    expect(feet(player)).toBeCloseTo(bridge.deckHeight);
  });

  it('lowers the view smoothly down the east ramp', () => {
    const player = { ...createPlayer(), x: bridge.deckEndX - 2, z: bridge.z };
    player.y = bridge.deckHeight + eyeHeight;
    const heights = walkAlong(player, bridge.rampEndX + 1);
    const biggestStep = Math.max(...heights.slice(1).map((h, i) => Math.abs(h - heights[i]!)));
    expect(biggestStep).toBeLessThan(0.1);
    expect(feet(player)).toBeCloseTo(config.world.roadLevel, 1);
  });

  it('never loses the ramp while climbing it (stays on the surface, not under it)', () => {
    const player = { ...createPlayer(), x: bridge.rampStartX - 2, z: bridge.z };
    walkAlong(player, bridge.deckStartX - 1);
    const surface = groundHeight(player.x, player.z, feet(player));
    expect(feet(player)).toBeCloseTo(surface, 1);
    expect(feet(player)).toBeGreaterThan(1);
  });
});

describe('the river', () => {
  const z = -40;
  const bankX = riverCenterX(z) - layout.river.width / 2;

  it('drops the player from the bank to the river bed after walking in', () => {
    const player = { ...createPlayer(), x: bankX - 2, z };
    walkAlong(player, bankX + 3);
    for (let i = 0; i < 120; i++) updatePlayerHeight(player, groundHeight, dt);
    expect(feet(player)).toBeCloseTo(bed);
  });

  it('drops no faster than the fall speed', () => {
    const player = { ...createPlayer(), x: bankX + 3, z };
    let last = player.y;
    for (let i = 0; i < 60; i++) {
      updatePlayerHeight(player, groundHeight, dt);
      expect(last - player.y).toBeLessThanOrEqual(fallSpeed * dt + 1e-9);
      last = player.y;
    }
  });

  it('climbs back out onto the bank', () => {
    const player = { ...createPlayer(), x: bankX + 3, z };
    player.y = bed + eyeHeight;
    walkAlong(player, bankX - 3);
    for (let i = 0; i < 120; i++) updatePlayerHeight(player, groundHeight, dt);
    expect(feet(player)).toBeCloseTo(config.world.roadLevel);
  });
});

describe('the deck', () => {
  it('drops to the river bed when walking off the side of the deck', () => {
    const player = { ...createPlayer(), x: riverCenterX(bridge.z), z: bridge.z };
    player.y = bridge.deckHeight + eyeHeight;
    player.z = bridge.z + bridge.deckWidth / 2 + 3;
    for (let i = 0; i < 200; i++) updatePlayerHeight(player, groundHeight, dt);
    expect(feet(player)).toBeCloseTo(bed);
  });

  it('stays at the river bed under the deck instead of being lifted onto it', () => {
    const player = { ...createPlayer(), x: riverCenterX(bridge.z), z: bridge.z };
    player.y = bed + eyeHeight;
    for (let i = 0; i < 120; i++) updatePlayerHeight(player, groundHeight, dt);
    expect(feet(player)).toBeCloseTo(bed);
  });
});
