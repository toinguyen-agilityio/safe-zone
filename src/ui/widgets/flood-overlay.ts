import type { UiContext } from '../mount';
import './flood-overlay.css';

export interface FloodOverlayState {
  /** The player stands inside the dry zone. */
  dry: boolean;
  parachuting: boolean;
  dead: boolean;
}

/**
 * The water overlay shows while the player is in the flood: outside the dry zone, on the ground
 * and alive. Under the parachute the player is above the water, and the dead need no warning.
 */
export function floodOverlayVisible({ dry, parachuting, dead }: FloodOverlayState): boolean {
  return !dry && !parachuting && !dead;
}

export function mount(ctx: UiContext): () => void {
  const overlay = document.createElement('div');
  overlay.className = 'flood-overlay';
  ctx.root.appendChild(overlay);

  let frame = 0;
  const refresh = () => {
    const { player, zone } = ctx;
    const visible = zone
      ? floodOverlayVisible({
          dry: zone.isDry(player.x, player.z),
          parachuting: player.parachuting,
          dead: player.dead,
        })
      : false;
    overlay.classList.toggle('flood-overlay-show', visible);
    frame = requestAnimationFrame(refresh);
  };
  frame = requestAnimationFrame(refresh);

  return () => {
    cancelAnimationFrame(frame);
    overlay.remove();
  };
}
