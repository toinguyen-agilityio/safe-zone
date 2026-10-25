import { describe, expect, it } from 'vitest';
import { createParachutingPlayer, createPlayer } from '../entities/player';
import { buildCanopy, updateCanopy } from './parachute';

describe('canopy', () => {
  it('is a striped dome with cords', () => {
    const canopy = buildCanopy();
    const panels = canopy.children.filter((c) => c.name === 'canopy-panel');
    const cords = canopy.children.filter((c) => c.name === 'canopy-cord');
    expect(panels.length).toBeGreaterThanOrEqual(8);
    expect(cords.length).toBeGreaterThanOrEqual(4);
  });

  it('hangs above the player while the drop lasts', () => {
    const canopy = buildCanopy();
    const player = createParachutingPlayer(1);
    updateCanopy(canopy, player);
    expect(canopy.visible).toBe(true);
    expect(canopy.position.x).toBe(player.x);
    expect(canopy.position.z).toBe(player.z);
    expect(canopy.position.y).toBeGreaterThan(player.y);
  });

  it('disappears once the player is walking', () => {
    const canopy = buildCanopy();
    updateCanopy(canopy, createPlayer());
    expect(canopy.visible).toBe(false);
  });
});
