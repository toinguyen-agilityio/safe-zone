import { describe, expect, it } from 'vitest';
import { config } from '../src/config';
import { createPlayer, type Player, type PlayerInput } from '../src/entities/player';
import { createMotionWorld, updatePlayerMotion } from '../src/systems/player-motion';
import { getBridges, type BridgeSpec } from '../src/world/bridges';
import { getLayout, riverCenterX } from '../src/world/layout';

/**
 * A simulated player, with no browser, crosses each bridge on foot and swims under it, using the
 * same update the game runs every frame.
 */
const layout = getLayout();
const world = createMotionWorld(layout);
const bridges = getBridges(layout);
const { eyeHeight } = config.player;
const bed = -config.world.river.bedDepth;
const dt = 1 / 60;
const TIME_LIMIT_SECONDS = 60;
/** How far past the foot of a ramp counts as having reached the bank. The foot can be next to a house. */
const BANK_MARGIN = 0.5;

/** Yaw that makes "forward" point along +x (east) and along +z (south). */
const FACE_EAST = -Math.PI / 2;
const FACE_SOUTH = Math.PI;

const forward: PlayerInput = {
  keys: { forward: true, back: false, left: false, right: false },
  mouseDelta: { x: 0, y: 0 },
  locked: true,
};

const feet = (p: Player) => p.y - eyeHeight;

/** Walk forward until `done` is true or the time limit passes; returns every frame's player. */
function simulate(player: Player, done: (p: Player) => boolean) {
  const frames: { x: number; z: number; feet: number; swimming: boolean; airborne: boolean }[] = [];
  const limit = Math.round(TIME_LIMIT_SECONDS / dt);
  let i = 0;
  while (i < limit && !done(player)) {
    updatePlayerMotion(player, forward, world, dt);
    frames.push({
      x: player.x,
      z: player.z,
      feet: feet(player),
      swimming: player.swimming,
      airborne: player.airborne,
    });
    i++;
  }
  return { frames, seconds: i * dt, finished: done(player) };
}

describe.each(bridges.map((b) => [b.name, b] as [string, BridgeSpec]))('%s', (_name, bridge) => {
  it('can be crossed on foot from one bank to the other within the time limit', () => {
    const player = {
      ...createPlayer(),
      x: bridge.rampStartX - BANK_MARGIN,
      z: bridge.z,
      yaw: FACE_EAST,
    };
    const result = simulate(player, (p) => p.x >= bridge.rampEndX + BANK_MARGIN);

    expect(result.finished).toBe(true);
    expect(result.seconds).toBeLessThan(TIME_LIMIT_SECONDS);

    // It really went over the deck: high above the water the whole way across the river.
    const overRiver = result.frames.filter((f) => f.x > bridge.deckStartX && f.x < bridge.deckEndX);
    expect(overRiver.length).toBeGreaterThan(0);
    for (const frame of overRiver) {
      expect(frame.feet).toBeGreaterThan(bridge.deckHeight - 0.7);
      expect(frame.swimming).toBe(false);
    }
    // It never fell in, and it steadily moved east without getting stuck.
    expect(result.frames.some((f) => f.swimming)).toBe(false);
    expect(Math.max(...result.frames.map((f) => Math.abs(f.z - bridge.z)))).toBeLessThan(0.5);
    expect(player.x).toBeGreaterThanOrEqual(bridge.rampEndX + BANK_MARGIN);
  });

  it('can be crossed in the other direction too', () => {
    const player = {
      ...createPlayer(),
      x: bridge.rampEndX + BANK_MARGIN,
      z: bridge.z,
      yaw: -FACE_EAST,
    };
    const result = simulate(player, (p) => p.x <= bridge.rampStartX - BANK_MARGIN);
    expect(result.finished).toBe(true);
    expect(result.frames.some((f) => f.swimming)).toBe(false);
  });

  it('lets the player swim under the deck, along the bridge, and pass freely', () => {
    const startX = bridge.deckStartX + 1;
    const endX = bridge.deckEndX - 1;
    // Start on the river bed, under the deck.
    const player = { ...createPlayer(), x: startX, z: bridge.z, yaw: FACE_EAST };
    player.y = bed + eyeHeight;
    const result = simulate(player, (p) => p.x >= endX);

    expect(result.finished).toBe(true);
    expect(result.seconds).toBeLessThan(TIME_LIMIT_SECONDS);
    for (const frame of result.frames) {
      expect(frame.swimming).toBe(true);
      // Under the deck means on the river bed, never lifted onto the deck.
      expect(frame.feet).toBeCloseTo(bed, 1);
    }
  });

  it('lets the player swim across the river under the deck from one side to the other', () => {
    const x = riverCenterX(bridge.z);
    const sideMargin = bridge.deckWidth / 2 + 6;
    const player = { ...createPlayer(), x, z: bridge.z - sideMargin, yaw: FACE_SOUTH };
    player.y = bed + eyeHeight;
    const result = simulate(player, (p) => p.z >= bridge.z + sideMargin);

    expect(result.finished).toBe(true);
    const underDeck = result.frames.filter((f) => Math.abs(f.z - bridge.z) < bridge.deckWidth / 2);
    expect(underDeck.length).toBeGreaterThan(10);
    for (const frame of underDeck) {
      expect(frame.swimming).toBe(true);
      expect(frame.feet).toBeCloseTo(bed, 1);
    }
  });
});

describe('all bridges', () => {
  it('are three, and every one of them passes both tests above', () => {
    expect(bridges).toHaveLength(3);
  });
});
