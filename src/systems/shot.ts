import { config } from '../config';
import type { EventBus } from '../core/events';
import { generateHouses } from '../world/houses';
import { getLandmarks } from '../world/landmarks';
import type { Layout, Rect } from '../world/types';
import { hitCharacter, type Character, type HitRegion } from '../physics/hitboxes';
import { raycast, type BoxQuery, type RayBox } from '../physics/raycast';
import { SpatialGrid } from '../physics/spatial-grid';
import type { ShotEvent } from './fire-control';

/** Something a shot can hit: a character with a name the damage can be attributed to. */
export interface Target extends Character {
  id: string;
}

/** What a shot can run into: solid things (houses) that stop it, and the targets. */
export interface ShotWorld {
  obstacles: BoxQuery<RayBox> | readonly RayBox[];
  /** Everyone who can be hit. The shooter is left out. */
  targets: () => Iterable<Target>;
}

export interface HitEvent {
  target: string;
  region: HitRegion;
  damage: number;
  /** How far from the shooter the bullet struck. */
  distance: number;
}

declare module '../core/events' {
  interface EventMap {
    hit: HitEvent;
  }
}

/** Damage of one bullet in a region: the body damage, doubled for the head. */
export function damageFor(region: HitRegion): number {
  const { bodyDamage, headMultiplier } = config.combat;
  return region === 'head' ? bodyDamage * headMultiplier : bodyDamage;
}

/**
 * Follow one shot. The nearest thing along the line is what it hits: a house in between stops it,
 * and of several targets the closest one is hit. Returns null when the shot hits nothing.
 */
export function resolveShot(
  shot: ShotEvent,
  world: ShotWorld,
  maxDist: number = config.combat.maxShotDistance,
): HitEvent | null {
  const ray = { origin: shot.origin, direction: shot.direction, maxDist };
  const wall = raycast(world.obstacles, shot.origin, shot.direction, maxDist);
  const wallDistance = wall ? wall.distance : Infinity;

  let best: HitEvent | null = null;
  for (const target of world.targets()) {
    const hit = hitCharacter(ray, target);
    if (!hit || (best && hit.distance >= best.distance)) continue;
    best = {
      target: target.id,
      region: hit.region,
      damage: damageFor(hit.region),
      distance: hit.distance,
    };
  }
  // A target exactly at the wall is behind it: the wall wins a tie.
  return best && best.distance < wallDistance ? best : null;
}

const toBox = (rect: Rect, height: number): RayBox => ({
  minX: rect.cx - rect.width / 2,
  maxX: rect.cx + rect.width / 2,
  minZ: rect.cz - rect.depth / 2,
  maxZ: rect.cz + rect.depth / 2,
  minY: 0,
  maxY: height,
});

/** Every house and landmark as a solid box with its real height. */
export function createShotObstacles(
  layout: Layout,
  seed: number = config.world.defaultSeed,
): SpatialGrid<RayBox> {
  const grid = new SpatialGrid<RayBox>();
  for (const house of generateHouses(layout, seed).houses) grid.insert(toBox(house, house.height));
  for (const landmark of getLandmarks(layout)) {
    grid.insert(toBox(landmark.footprint, landmark.height));
  }
  return grid;
}

/** Resolve every `shot` event and emit a `hit` event when it strikes a target. */
export function connectShotResolution(events: EventBus, world: ShotWorld): () => void {
  return events.on('shot', (shot) => {
    const hit = resolveShot(shot, world);
    if (hit) events.emit('hit', hit);
  });
}
