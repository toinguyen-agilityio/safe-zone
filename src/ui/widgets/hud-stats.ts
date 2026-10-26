import { config } from '../../config';
import type { KillRecord } from '../../systems/kill-log';
import type { UiContext } from '../mount';
import './hud-stats.css';

const PLAYER_ID = 'player';

/** Everyone in the match at the start: the player and the bots. */
export const TOTAL_PLAYERS = config.bots.count + 1;

/** Counts how many are still alive and how many the player has shot, from the kill events. */
export class MatchStats {
  private dead = new Set<string>();
  private mine = 0;

  constructor(private readonly total: number = TOTAL_PLAYERS) {}

  onKill(kill: KillRecord): void {
    // A victim counts once, however many events name them.
    if (this.dead.has(kill.victim)) return;
    this.dead.add(kill.victim);
    if (kill.killer === PLAYER_ID && kill.victim !== PLAYER_ID) this.mine++;
  }

  get alive(): number {
    return Math.max(0, this.total - this.dead.size);
  }

  get kills(): number {
    return this.mine;
  }
}

export interface StatsView {
  aliveLabel: string;
  alive: string;
  killsLabel: string;
  kills: string;
}

/** What the two counters show, with Vietnamese labels. */
export function statsView(stats: Pick<MatchStats, 'alive' | 'kills'>): StatsView {
  return {
    aliveLabel: 'Còn sống',
    alive: `${stats.alive}`,
    killsLabel: 'Hạ gục',
    kills: `${stats.kills}`,
  };
}

function stat(): { root: HTMLElement; value: HTMLElement; label: HTMLElement } {
  const root = document.createElement('div');
  root.className = 'hud-stat';
  const value = document.createElement('div');
  value.className = 'hud-stat-value';
  const label = document.createElement('div');
  label.className = 'hud-stat-label';
  root.append(value, label);
  return { root, value, label };
}

export function mount(ctx: UiContext): () => void {
  const panel = document.createElement('div');
  panel.className = 'hud-stats';
  const alive = stat();
  const kills = stat();
  panel.append(alive.root, kills.root);
  ctx.root.appendChild(panel);

  const stats = new MatchStats();
  const show = () => {
    const view = statsView(stats);
    alive.value.textContent = view.alive;
    alive.label.textContent = view.aliveLabel;
    kills.value.textContent = view.kills;
    kills.label.textContent = view.killsLabel;
  };
  show();
  const stopListening = ctx.events.on('kill', (kill) => {
    stats.onKill(kill);
    show();
  });

  return () => {
    stopListening();
    panel.remove();
  };
}
