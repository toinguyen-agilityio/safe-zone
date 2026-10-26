import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { EventBus } from '../core/events';
import { SpatialGrid } from '../physics/spatial-grid';
import { getLayout } from '../world/layout';
import type { RayBox } from '../physics/raycast';
import type { ShotEvent } from './fire-control';
import {
  connectShotResolution,
  createShotObstacles,
  damageFor,
  resolveShot,
  type HitEvent,
  type Target,
  type ShotWorld,
} from './shot';

const { bodyDamage, headMultiplier } = config.combat;

/** A straight shot east at eye height. */
const straight = (): ShotEvent => ({
  origin: { x: 0, y: 1.2, z: 0 },
  direction: { x: 1, y: 0, z: 0 },
});

const target = (id: string, x: number, z = 0, feetY = 0): Target => ({ id, x, z, feetY });
const house = (minX: number, maxX: number, height = 10): RayBox => ({
  minX,
  maxX,
  minZ: -5,
  maxZ: 5,
  minY: 0,
  maxY: height,
});
const world = (obstacles: ShotWorld['obstacles'], targets: Target[]): ShotWorld => ({
  obstacles,
  targets: () => targets,
});

describe('damage', () => {
  it('is the body damage for the torso and legs and double that for the head', () => {
    expect(damageFor('torso')).toBe(bodyDamage);
    expect(damageFor('legs')).toBe(bodyDamage);
    expect(damageFor('head')).toBe(bodyDamage * headMultiplier);
    expect(headMultiplier).toBe(2);
    expect(damageFor('head')).toBe(2 * damageFor('torso'));
  });
});

describe('houses block shots', () => {
  it('stops a shot at a house between the shooter and the target', () => {
    const w = world([house(10, 20)], [target('bot-1', 40)]);
    expect(resolveShot(straight(), w)).toBeNull();
  });

  it('hits the target when nothing is in between', () => {
    const hit = resolveShot(straight(), world([], [target('bot-1', 40)]));
    expect(hit?.target).toBe('bot-1');
    expect(hit?.region).toBe('torso');
    expect(hit?.damage).toBe(bodyDamage);
    expect(hit?.distance).toBeCloseTo(40 - config.combat.hitboxes.halfWidth);
  });

  it('is not blocked by a house behind the target', () => {
    const hit = resolveShot(straight(), world([house(60, 70)], [target('bot-1', 40)]));
    expect(hit?.target).toBe('bot-1');
  });

  it('is not blocked by a house that is lower than the shot', () => {
    const lowWall = house(10, 20, 0.5);
    expect(resolveShot(straight(), world([lowWall], [target('bot-1', 40)]))?.target).toBe('bot-1');
  });

  it('is blocked by a house when the target is exactly at its wall', () => {
    expect(resolveShot(straight(), world([house(40.2, 50)], [target('bot-1', 40.6)]))).toBeNull();
  });
});

describe('the nearest thing wins', () => {
  it('hits the closest of several targets in a line', () => {
    const w = world([], [target('far', 60), target('near', 30), target('middle', 45)]);
    expect(resolveShot(straight(), w)?.target).toBe('near');
  });

  it('hits a nearer target even when a house stands behind it', () => {
    const w = world([house(50, 60)], [target('near', 30)]);
    expect(resolveShot(straight(), w)?.target).toBe('near');
  });

  it('hits nobody when the shot goes past everyone', () => {
    const w = world([], [target('bot-1', 40, 10)]);
    expect(resolveShot(straight(), w)).toBeNull();
  });

  it('does not reach a target beyond the maximum distance', () => {
    const w = world([], [target('far', 500)]);
    expect(resolveShot(straight(), w)).toBeNull();
    expect(resolveShot(straight(), w, 600)?.target).toBe('far');
  });
});

describe('head shots', () => {
  it('does double damage to the head compared with the torso', () => {
    const w = world([], [target('bot-1', 20)]);
    const torso = resolveShot(
      { origin: { x: 0, y: 1.2, z: 0 }, direction: { x: 1, y: 0, z: 0 } },
      w,
    );
    const head = resolveShot(
      { origin: { x: 0, y: 1.65, z: 0 }, direction: { x: 1, y: 0, z: 0 } },
      w,
    );
    expect(torso?.region).toBe('torso');
    expect(head?.region).toBe('head');
    expect(head!.damage).toBe(2 * torso!.damage);
  });

  it('hits the legs low down', () => {
    const w = world([], [target('bot-1', 20)]);
    const legs = resolveShot(
      { origin: { x: 0, y: 0.3, z: 0 }, direction: { x: 1, y: 0, z: 0 } },
      w,
    );
    expect(legs?.region).toBe('legs');
    expect(legs?.damage).toBe(bodyDamage);
  });
});

describe('the shot event wiring', () => {
  it('emits a hit event for a shot that strikes a target and nothing for a miss', () => {
    const events = new EventBus();
    const hits: HitEvent[] = [];
    events.on('hit', (hit) => hits.push(hit));
    connectShotResolution(events, world([], [target('bot-1', 30)]));

    events.emit('shot', straight());
    expect(hits).toHaveLength(1);
    expect(hits[0]!.target).toBe('bot-1');

    events.emit('shot', { origin: { x: 0, y: 1.2, z: 0 }, direction: { x: -1, y: 0, z: 0 } });
    expect(hits).toHaveLength(1);
  });

  it('stops resolving shots after it is disconnected', () => {
    const events = new EventBus();
    const hits: HitEvent[] = [];
    events.on('hit', (hit) => hits.push(hit));
    const disconnect = connectShotResolution(events, world([], [target('bot-1', 30)]));
    disconnect();
    events.emit('shot', straight());
    expect(hits).toHaveLength(0);
  });
});

describe('the real city', () => {
  const layout = getLayout();
  const obstacles = createShotObstacles(layout);

  it('stops a shot at a real house, and lets one pass along a street', () => {
    expect(obstacles).toBeInstanceOf(SpatialGrid);
    // Along the north-south street at x = 0, nothing stands in the way for a long stretch.
    const alongStreet: ShotEvent = {
      origin: { x: 0, y: 1.5, z: 0 },
      direction: { x: 0, y: 0, z: -1 },
    };
    const down = world(obstacles.queryBox({ minX: -1, maxX: 1, minZ: -300, maxZ: 0 }), [
      target('bot-1', 0, -60),
    ]);
    expect(resolveShot(alongStreet, down)?.target).toBe('bot-1');

    // Across the street into the houses at x = -8: a target behind that first row is shielded.
    const across: ShotEvent = {
      origin: { x: 0, y: 1.5, z: -30 },
      direction: { x: -1, y: 0, z: 0 },
    };
    const shielded = world(obstacles, [target('bot-2', -60, -30)]);
    expect(resolveShot(across, shielded)).toBeNull();
  });
});
