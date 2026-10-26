import type { EventBus } from './events';

/** Where the app is: on the start screen, playing a match, or looking at the result. */
export type AppPhase = 'menu' | 'match' | 'ended';

declare module './events' {
  interface EventMap {
    /** The app moved from one phase to another. */
    appstate: { from: AppPhase; to: AppPhase };
  }
}

/**
 * The three states of the app. The page opens in `menu`, entering the match starts the drop and
 * ending it shows the result. Nothing else moves: a state can only be entered from the one
 * before it, so a stray call cannot restart or skip a match.
 */
export class AppState {
  private current: AppPhase = 'menu';

  constructor(private readonly events?: EventBus) {}

  get state(): AppPhase {
    return this.current;
  }

  get inMatch(): boolean {
    return this.current === 'match';
  }

  /** Leave the menu and start the match, with the parachute drop. Returns false if not in the menu. */
  enterMatch(): boolean {
    return this.change('menu', 'match');
  }

  /** The match is over. Returns false if there is no match running. */
  endMatch(): boolean {
    return this.change('match', 'ended');
  }

  private change(from: AppPhase, to: AppPhase): boolean {
    if (this.current !== from) return false;
    this.current = to;
    this.events?.emit('appstate', { from, to });
    return true;
  }
}
