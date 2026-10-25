import { config } from '../../config';
import type { Inventory } from '../../entities/inventory';
import type { Weapon } from '../../entities/weapon';
import type { UiContext } from '../mount';
import './hud-ammo.css';

export interface AmmoView {
  /** Rounds in the magazine. */
  magazine: string;
  /** Rounds in reserve. */
  reserve: string;
  /** Shown while reloading, or when there is no ammo left. */
  state: string;
  empty: boolean;
  banhMiLabel: string;
  banhMi: string;
  juiceLabel: string;
  juice: string;
}

/** What the ammo and item counters show, with Vietnamese labels. */
export function ammoView(
  weapon: Pick<Weapon, 'magazine' | 'reserve' | 'reloading'>,
  inventory: Pick<Inventory, 'count'>,
): AmmoView {
  const { banhMi, sugarcaneJuice } = config.loot.carryLimit;
  const empty = weapon.magazine === 0 && weapon.reserve === 0;
  return {
    magazine: `${weapon.magazine}`,
    reserve: `${weapon.reserve}`,
    state: weapon.reloading ? 'Đang nạp đạn…' : empty ? 'Hết đạn' : '',
    empty,
    banhMiLabel: '1 Bánh mì',
    banhMi: `${inventory.count('banhMi')}/${banhMi}`,
    juiceLabel: '2 Nước mía',
    juice: `${inventory.count('sugarcaneJuice')}/${sugarcaneJuice}`,
  };
}

function text(className: string): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  return el;
}

export function mount(ctx: UiContext): () => void {
  const panel = text('hud-ammo');
  const count = text('hud-ammo-count');
  const reserve = text('hud-ammo-reserve');
  const state = text('hud-ammo-state');
  const items = text('hud-items');
  const banhMi = document.createElement('span');
  const juice = document.createElement('span');
  items.append(banhMi, juice);
  panel.append(state, count, reserve, items);
  ctx.root.appendChild(panel);

  let last = '';
  let frame = 0;
  const refresh = () => {
    if (ctx.weapon && ctx.inventory) {
      const view = ammoView(ctx.weapon, ctx.inventory);
      const key = JSON.stringify(view);
      if (key !== last) {
        last = key;
        count.textContent = view.magazine;
        reserve.textContent = `Đạn dự trữ: ${view.reserve}`;
        state.textContent = view.state;
        panel.classList.toggle('hud-ammo-empty', view.empty);
        banhMi.textContent = `${view.banhMiLabel}: ${view.banhMi}`;
        juice.textContent = `${view.juiceLabel}: ${view.juice}`;
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
