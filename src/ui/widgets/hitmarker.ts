import type { HitRegion } from '../../physics/hitboxes';
import type { HitEvent } from '../../systems/shot';
import type { UiContext } from '../mount';
import './hitmarker.css';

/** Milliseconds a hitmarker stays on the crosshair. */
export const HITMARKER_MS = 150;
/** Whose hits the player sees marked. */
const PLAYER_ID = 'player';

export const HEAD_COLOR = '#ffd400';
export const BODY_COLOR = '#ffffff';

/** A head hit is yellow, anything else white. */
export function hitmarkerColor(region: HitRegion): string {
  return region === 'head' ? HEAD_COLOR : BODY_COLOR;
}

/** Only hits the player landed show a hitmarker, not hits between others. */
export function showsHitmarker(hit: Pick<HitEvent, 'shooter'>): boolean {
  return hit.shooter === PLAYER_ID;
}

export function mount(ctx: UiContext): () => void {
  const crosshair = document.createElement('div');
  crosshair.className = 'crosshair';
  const marker = document.createElement('div');
  marker.className = 'hitmarker';
  ctx.root.append(crosshair, marker);

  let timer: ReturnType<typeof setTimeout> | undefined;
  const stopListening = ctx.events.on('hit', (hit) => {
    if (!showsHitmarker(hit)) return;
    marker.classList.toggle('hitmarker-head', hit.region === 'head');
    marker.classList.add('hitmarker-show');
    clearTimeout(timer);
    timer = setTimeout(() => marker.classList.remove('hitmarker-show'), HITMARKER_MS);
  });

  return () => {
    stopListening();
    clearTimeout(timer);
    crosshair.remove();
    marker.remove();
  };
}
