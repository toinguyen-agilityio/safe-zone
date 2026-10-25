import type { UiContext } from '../mount';
import { damageDirection } from '../damage-direction';
import './damage-indicator.css';

/** Milliseconds the arc stays fully lit before it fades. */
export const INDICATOR_MS = 300;
/** Whose damage the arc shows. */
const PLAYER_ID = 'player';

export function mount(ctx: UiContext): () => void {
  const arc = document.createElement('div');
  arc.className = 'damage-indicator';
  ctx.root.appendChild(arc);

  let from: { x: number; z: number } | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let frame = 0;

  // The arc keeps pointing at where the shot came from while the player turns.
  const point = () => {
    if (from) arc.style.transform = `rotate(${damageDirection(ctx.player, from)}rad)`;
    frame = requestAnimationFrame(point);
  };

  const stopListening = ctx.events.on('damage', (damage) => {
    if (damage.target !== PLAYER_ID || !damage.from) return;
    from = damage.from;
    arc.style.transform = `rotate(${damageDirection(ctx.player, from)}rad)`;
    arc.classList.add('damage-indicator-show');
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(point);
    clearTimeout(timer);
    timer = setTimeout(() => {
      arc.classList.remove('damage-indicator-show');
      cancelAnimationFrame(frame);
    }, INDICATOR_MS);
  });

  return () => {
    stopListening();
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    arc.remove();
  };
}
