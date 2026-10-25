import { describe, expect, it } from 'vitest';
import { floodOverlayVisible } from './flood-overlay';

const standing = { dry: true, parachuting: false, dead: false };

describe('floodOverlayVisible', () => {
  it('is hidden inside the dry zone', () => {
    expect(floodOverlayVisible(standing)).toBe(false);
  });

  it('shows when the player is outside the dry zone', () => {
    expect(floodOverlayVisible({ ...standing, dry: false })).toBe(true);
  });

  it('disappears again when the player returns inside', () => {
    const outside = floodOverlayVisible({ ...standing, dry: false });
    const back = floodOverlayVisible({ ...standing, dry: true });
    expect([outside, back]).toEqual([true, false]);
  });

  it('is hidden under the parachute, where the player is above the water', () => {
    expect(floodOverlayVisible({ dry: false, parachuting: true, dead: false })).toBe(false);
  });

  it('is hidden once the player is dead', () => {
    expect(floodOverlayVisible({ dry: false, parachuting: false, dead: true })).toBe(false);
  });
});
