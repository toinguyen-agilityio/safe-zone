import { describe, expect, it } from 'vitest';
import { config } from '../config';
import { characterBoxes, hitCharacter, hitRegion, type Character, type Ray } from './hitboxes';

const { legsTop, torsoTop, height, halfWidth } = config.combat.hitboxes;
const standing: Character = { x: 20, z: 0, feetY: 0 };

/** A level ray from 20 units west of the character, at the given height, heading east. */
const levelAt = (y: number, sideways = 0): Ray => ({
  origin: { x: 0, y, z: sideways },
  direction: { x: 1, y: 0, z: 0 },
});

describe('aiming at each region', () => {
  it('hits the legs low down', () => {
    expect(hitRegion(levelAt(0.1), standing)).toBe('legs');
    expect(hitRegion(levelAt(legsTop - 0.05), standing)).toBe('legs');
  });

  it('hits the torso in the middle', () => {
    expect(hitRegion(levelAt(legsTop + 0.05), standing)).toBe('torso');
    expect(hitRegion(levelAt(1.2), standing)).toBe('torso');
    expect(hitRegion(levelAt(torsoTop - 0.05), standing)).toBe('torso');
  });

  it('hits the head at the top', () => {
    expect(hitRegion(levelAt(torsoTop + 0.05), standing)).toBe('head');
    expect(hitRegion(levelAt(1.65), standing)).toBe('head');
    expect(hitRegion(levelAt(height - 0.05), standing)).toBe('head');
  });
});

describe('aiming past the character', () => {
  it('misses above the head and below the feet', () => {
    expect(hitRegion(levelAt(height + 0.1), standing)).toBe('none');
    expect(hitRegion(levelAt(-0.1), standing)).toBe('none');
  });

  it('misses to either side', () => {
    expect(hitRegion(levelAt(1.2, halfWidth + 0.1), standing)).toBe('none');
    expect(hitRegion(levelAt(1.2, -halfWidth - 0.1), standing)).toBe('none');
    expect(hitRegion(levelAt(1.2, halfWidth - 0.05), standing)).toBe('torso');
  });

  it('misses when the head is narrower than the body', () => {
    const { headHalfWidth } = config.combat.hitboxes;
    expect(headHalfWidth).toBeLessThan(halfWidth);
    expect(hitRegion(levelAt(1.65, headHalfWidth + 0.05), standing)).toBe('none');
    expect(hitRegion(levelAt(1.2, headHalfWidth + 0.05), standing)).toBe('torso');
  });

  it('misses when aiming away from the character or too short', () => {
    const away: Ray = { origin: { x: 0, y: 1.2, z: 0 }, direction: { x: -1, y: 0, z: 0 } };
    expect(hitRegion(away, standing)).toBe('none');
    expect(hitRegion({ ...levelAt(1.2), maxDist: 10 }, standing)).toBe('none');
    expect(hitRegion({ ...levelAt(1.2), maxDist: 25 }, standing)).toBe('torso');
  });
});

describe('moving characters and sloping rays', () => {
  it('follows the character to a higher ground, such as a bridge deck', () => {
    const onDeck = { ...standing, feetY: 6 };
    expect(hitRegion(levelAt(1.2), onDeck)).toBe('none');
    expect(hitRegion(levelAt(6 + 1.2), onDeck)).toBe('torso');
  });

  it('reports the region met first by a ray from above and a ray from below', () => {
    const slope = (rise: number) => {
      const length = Math.hypot(1, rise);
      return { x: 1 / length, y: rise / length, z: 0 };
    };
    // Coming down at a gentle slope it reaches head height first, and enters the head.
    const fromAbove: Ray = { origin: { x: 0, y: 3.5, z: 0 }, direction: slope(-0.1) };
    expect(hitRegion(fromAbove, standing)).toBe('head');
    // Coming up from below it enters the legs first.
    const fromBelow: Ray = { origin: { x: 0, y: -1.5, z: 0 }, direction: slope(0.1) };
    expect(hitRegion(fromBelow, standing)).toBe('legs');
  });

  it('reports the distance to the region it enters', () => {
    const hit = hitCharacter(levelAt(1.2), standing);
    expect(hit?.region).toBe('torso');
    expect(hit?.distance).toBeCloseTo(20 - halfWidth);
    expect(hitCharacter(levelAt(5), standing)).toBeNull();
  });
});

describe('the boxes', () => {
  it('stack from the feet to the top with no gaps', () => {
    const [legs, torso, head] = characterBoxes({ x: 0, z: 0, feetY: 2 });
    expect(legs!.minY).toBe(2);
    expect(legs!.maxY).toBe(torso!.minY);
    expect(torso!.maxY).toBe(head!.minY);
    expect(head!.maxY).toBeCloseTo(2 + height);
  });
});
