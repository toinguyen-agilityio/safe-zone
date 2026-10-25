import { config } from '../config';
import { raycast, type RayBox, type Vec3 } from './raycast';

export type HitRegion = 'head' | 'torso' | 'legs';

/** A character standing at (x, z) with the feet at `feetY`. */
export interface Character {
  x: number;
  z: number;
  feetY: number;
}

export interface Ray {
  origin: Vec3;
  /** Unit vector. */
  direction: Vec3;
  /** How far the ray reaches. Defaults to the whole map. */
  maxDist?: number;
}

export interface CharacterHit {
  region: HitRegion;
  /** Distance along the ray to where it enters that region. */
  distance: number;
}

interface RegionBox extends RayBox {
  region: HitRegion;
}

/** The three stacked boxes of a character: legs at the bottom, torso, then the narrower head. */
export function characterBoxes(character: Character): RegionBox[] {
  const { legsTop, torsoTop, height, halfWidth, headHalfWidth } = config.combat.hitboxes;
  const column = (region: HitRegion, from: number, to: number, half: number): RegionBox => ({
    region,
    minX: character.x - half,
    maxX: character.x + half,
    minZ: character.z - half,
    maxZ: character.z + half,
    minY: character.feetY + from,
    maxY: character.feetY + to,
  });
  return [
    column('legs', 0, legsTop, halfWidth),
    column('torso', legsTop, torsoTop, halfWidth),
    column('head', torsoTop, height, headHalfWidth),
  ];
}

/** Which region of the character the ray meets first, and how far away, or null for a miss. */
export function hitCharacter(ray: Ray, character: Character): CharacterHit | null {
  const maxDist = ray.maxDist ?? config.world.mapSize;
  const hit = raycast(characterBoxes(character), ray.origin, ray.direction, maxDist);
  return hit ? { region: hit.box.region, distance: hit.distance } : null;
}

/** Which region of the character the ray hits first: head, torso, legs, or none. */
export function hitRegion(ray: Ray, character: Character): HitRegion | 'none' {
  return hitCharacter(ray, character)?.region ?? 'none';
}
