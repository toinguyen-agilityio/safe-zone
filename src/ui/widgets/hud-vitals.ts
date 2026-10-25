import { config } from '../../config';
import type { Health } from '../../entities/health';
import type { UiContext } from '../mount';
import './hud-vitals.css';

/** Health at or below this is shown as a warning. */
export const LOW_HEALTH = 30;

export interface VitalsView {
  healthLabel: string;
  healthText: string;
  /** How full the bar is, 0 to 100. */
  healthPercent: number;
  low: boolean;
  armorLabel: string;
  armorText: string;
  armorPercent: number;
}

/** What the health and armor bars show for a health state, with Vietnamese labels. */
export function vitalsView(health: Pick<Health, 'health' | 'armor'>): VitalsView {
  const hp = Math.max(0, Math.ceil(health.health));
  const armor = Math.max(0, Math.ceil(health.armor));
  return {
    healthLabel: 'Máu',
    healthText: `${hp}`,
    healthPercent: Math.min(100, (hp / config.player.health) * 100),
    low: hp <= LOW_HEALTH,
    armorLabel: 'Giáp',
    armorText: `${armor}`,
    armorPercent: Math.min(100, (armor / config.player.armorMax) * 100),
  };
}

function bar(kind: 'health' | 'armor'): {
  root: HTMLElement;
  fill: HTMLElement;
  label: HTMLElement;
  value: HTMLElement;
} {
  const root = document.createElement('div');
  root.className = `hud-bar hud-bar-${kind}`;
  const fill = document.createElement('div');
  fill.className = 'hud-bar-fill';
  const text = document.createElement('div');
  text.className = 'hud-bar-label';
  const label = document.createElement('span');
  const value = document.createElement('span');
  text.append(label, value);
  root.append(fill, text);
  return { root, fill, label, value };
}

export function mount(ctx: UiContext): () => void {
  const panel = document.createElement('div');
  panel.className = 'hud-vitals';
  const hp = bar('health');
  const armor = bar('armor');
  panel.append(hp.root, armor.root);
  ctx.root.appendChild(panel);

  let last = '';
  let frame = 0;
  const refresh = () => {
    if (ctx.health) {
      const view = vitalsView(ctx.health);
      // Only touch the page when something changed.
      const key = JSON.stringify(view);
      if (key !== last) {
        last = key;
        hp.label.textContent = view.healthLabel;
        hp.value.textContent = view.healthText;
        hp.fill.style.width = `${view.healthPercent}%`;
        hp.root.classList.toggle('hud-low', view.low);
        armor.label.textContent = view.armorLabel;
        armor.value.textContent = view.armorText;
        armor.fill.style.width = `${view.armorPercent}%`;
      }
    }
    frame = requestAnimationFrame(refresh);
  };
  frame = requestAnimationFrame(refresh);

  return () => {
    cancelAnimationFrame(frame);
    panel.remove();
  };
}
