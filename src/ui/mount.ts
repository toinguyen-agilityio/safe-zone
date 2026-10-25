import type { EventBus } from '../core/events';
import type { Pause } from '../core/pause';
import type { Health } from '../entities/health';
import type { Inventory } from '../entities/inventory';
import type { Player } from '../entities/player';
import type { Weapon } from '../entities/weapon';
import './ui-root.css';

/** What every widget gets: its place on screen, the event bus and the game state. */
export interface UiContext {
  root: HTMLElement;
  events: EventBus;
  player: Player;
  pause: Pause;
  /** The player's health and armor, for the HUD. */
  health?: Health;
  /** The rifle and the bag, for the ammo and item counts. */
  weapon?: Weapon;
  inventory?: Inventory;
  /** The flood zone, for widgets that react to standing outside the dry zone. */
  zone?: {
    isDry: (x: number, z: number) => boolean;
    /** The phase, 1 to 5. */
    phase: number;
    stage: 'wait' | 'shrink' | 'done';
    /** Seconds left in the current wait or shrink. */
    stageLeft: number;
  };
  /** Ask the browser to capture the mouse again. Needs a click or key press to work. */
  requestPointerLock: () => void;
}

/** A widget file exports `mount`. It may return a function that removes the widget. */
export interface WidgetModule {
  mount: (ctx: UiContext) => void | (() => void);
}

/** The parts of the page the overlay needs, so tests can pass plain objects. */
export interface UiDocument {
  createElement: (tag: string) => HTMLElement;
}

export function createUiRoot(
  parent: { appendChild: (node: HTMLElement) => unknown },
  doc: UiDocument = document,
): HTMLElement {
  const root = doc.createElement('div');
  root.id = 'ui-root';
  parent.appendChild(root);
  return root;
}

/** Mount every widget with the same context. Returns a function that removes them all. */
export function mountWidgets(ctx: UiContext, widgets: readonly WidgetModule[]): () => void {
  const cleanups: (() => void)[] = [];
  for (const widget of widgets) {
    const cleanup = widget.mount(ctx);
    if (cleanup) cleanups.push(cleanup);
  }
  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}

/** Every `src/ui/widgets/*.ts` file except tests, so a widget task only adds new files. */
export function loadWidgets(): WidgetModule[] {
  const modules = import.meta.glob<WidgetModule>(['./widgets/*.ts', '!./widgets/*.test.ts'], {
    eager: true,
  });
  return Object.values(modules);
}

/** Create the overlay root and mount all widgets into it. */
export function mountUi(
  parent: HTMLElement,
  deps: Omit<UiContext, 'root'>,
  widgets: readonly WidgetModule[] = loadWidgets(),
): () => void {
  const root = createUiRoot(parent);
  const unmount = mountWidgets({ ...deps, root }, widgets);
  return () => {
    unmount();
    root.remove();
  };
}
