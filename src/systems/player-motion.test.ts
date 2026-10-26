import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { createPlayer, type Player, type PlayerInput } from '../entities/player';
import { getBridges } from '../world/bridges';
import type { MoveKeys } from './movement';
import { getLayout, riverCenterX } from '../world/layout';
import { createMotionWorld, updatePlayerMotion } from './player-motion';

const { eyeHeight, walkSpeed, sprintMultiplier, swimSpeed, jumpSpeed, gravity } = config.player;
const layout = getLayout();
const world = createMotionWorld(layout);
const dt = 1 / 60;
const bed = -config.world.river.bedDepth;

interface Frame {
  keys?: Partial<MoveKeys>;
  jump?: boolean;
  locked?: boolean;
}

/** An input for one frame; keys not named are up, and the mouse is captured unless said otherwise. */
const input = (frame: Frame = {}): PlayerInput => ({
  keys: { forward: false, back: false, left: false, right: false, ...frame.keys },
  mouseDelta: { x: 0, y: 0 },
  locked: frame.locked ?? true,
  jump: frame.jump,
});

const run = (player: Player, frames: number, make: () => PlayerInput) => {
  for (let i = 0; i < frames; i++) updatePlayerMotion(player, make(), world, dt);
};
const feet = (p: Player) => p.y - eyeHeight;

describe('standing', () => {
  it('stays on the ground with all flags off', () => {
    const player = createPlayer();
    run(player, 60, () => input());
    expect(player.y).toBeCloseTo(eyeHeight);
    expect(player).toMatchObject({ swimming: false, sprinting: false, airborne: false, vy: 0 });
  });
});

describe('jumping', () => {
  it('jumps up, shows airborne, and lands back on the ground', () => {
    const player = createPlayer();
    let apex = 0;
    let sawAirborne = false;
    for (let i = 0; i < 120; i++) {
      updatePlayerMotion(player, input({ jump: i === 0 }), world, dt);
      apex = Math.max(apex, feet(player));
      sawAirborne ||= player.airborne;
    }
    expect(sawAirborne).toBe(true);
    // One frame is 1/60 s, so the apex is a little under the ideal v^2 / 2g.
    const ideal = (jumpSpeed * jumpSpeed) / (2 * gravity);
    expect(apex).toBeGreaterThan(ideal - 0.12);
    expect(apex).toBeLessThanOrEqual(ideal + 1e-6);
    expect(player.airborne).toBe(false);
    expect(feet(player)).toBeCloseTo(0);
  });

  it('cannot jump again in the air', () => {
    const held = createPlayer();
    const once = createPlayer();
    let heldApex = 0;
    let onceApex = 0;
    for (let i = 0; i < 40; i++) {
      updatePlayerMotion(held, input({ jump: true }), world, dt);
      updatePlayerMotion(once, input({ jump: i === 0 }), world, dt);
      heldApex = Math.max(heldApex, feet(held));
      onceApex = Math.max(onceApex, feet(once));
    }
    expect(heldApex).toBeCloseTo(onceApex, 5);
  });

  it('ignores the jump key while the mouse is not captured', () => {
    const player = createPlayer();
    run(player, 30, () => input({ jump: true, locked: false }));
    expect(feet(player)).toBeCloseTo(0);
    expect(player.airborne).toBe(false);
  });
});

describe('sprinting', () => {
  it('moves faster with Shift and sets the sprinting flag only while moving', () => {
    const walker = createPlayer();
    const sprinter = createPlayer();
    run(walker, 60, () => input({ keys: { forward: true } }));
    run(sprinter, 60, () => input({ keys: { forward: true, sprint: true } }));
    expect(Math.abs(walker.z)).toBeCloseTo(walkSpeed, 1);
    expect(Math.abs(sprinter.z)).toBeCloseTo(walkSpeed * sprintMultiplier, 1);
    expect(walker.sprinting).toBe(false);
    expect(sprinter.sprinting).toBe(true);

    const standing = createPlayer();
    run(standing, 5, () => input({ keys: { sprint: true } }));
    expect(standing.sprinting).toBe(false);
  });
});

describe('swimming', () => {
  const z = -40;
  const x = riverCenterX(z);

  it('sinks to the river bed, sets the swimming flag and moves slowly with no sprint bonus', () => {
    const player = { ...createPlayer(), x, z };
    run(player, 120, () => input());
    expect(feet(player)).toBeCloseTo(bed);
    expect(player.swimming).toBe(true);

    const startZ = player.z;
    run(player, 60, () => input({ keys: { forward: true, sprint: true } }));
    expect(Math.abs(player.z - startZ)).toBeCloseTo(swimSpeed, 1);
    expect(player.sprinting).toBe(false);
  });

  it('cannot jump off the river bed', () => {
    const player = { ...createPlayer(), x, z };
    run(player, 120, () => input());
    run(player, 30, () => input({ jump: true }));
    expect(feet(player)).toBeCloseTo(bed);
  });

  it('shows airborne while dropping from the bank, then swimming', () => {
    const bank = x - layout.river.width / 2;
    const player = { ...createPlayer(), x: bank - 0.5, z };
    let airborne = false;
    for (let i = 0; i < 90; i++) {
      updatePlayerMotion(player, input({ keys: { forward: false, right: false } }), world, dt);
      player.x = Math.min(player.x + 0.1, bank + 1);
      airborne ||= player.airborne;
    }
    expect(airborne).toBe(true);
    expect(player.swimming).toBe(true);
  });
});

describe('collision and ramps still work', () => {
  it('stops at the map edge', () => {
    const player = { ...createPlayer(), x: config.world.mapSize / 2 - 2, z: 0, yaw: -Math.PI / 2 };
    run(player, 240, () => input({ keys: { forward: true } }));
    expect(player.x).toBeCloseTo(config.world.mapSize / 2 - config.player.radius);
  });

  it('walks up the bridge ramp onto the deck without being counted as airborne', () => {
    const bridge = getBridges(layout).find((b) => b.id === 'dragon')!;
    const player = { ...createPlayer(), x: bridge.rampStartX - 1, z: bridge.z, yaw: -Math.PI / 2 };
    // Yaw -90 degrees faces +x, along the bridge.
    let everAirborne = false;
    for (let i = 0; i < 600 && player.x < bridge.deckStartX + 3; i++) {
      updatePlayerMotion(player, input({ keys: { forward: true } }), world, dt);
      everAirborne ||= player.airborne;
    }
    expect(everAirborne).toBe(false);
    expect(feet(player)).toBeCloseTo(bridge.deckHeight, 0);
  });
});
