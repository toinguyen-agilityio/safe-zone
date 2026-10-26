import { describe, expect, it } from 'vitest';
import { AppState } from './app-state';
import { EventBus } from './events';

describe('AppState', () => {
  it('starts in the menu, with no match running', () => {
    const app = new AppState();
    expect(app.state).toBe('menu');
    expect(app.inMatch).toBe(false);
  });

  it('enterMatch switches to match', () => {
    const app = new AppState();
    expect(app.enterMatch()).toBe(true);
    expect(app.state).toBe('match');
    expect(app.inMatch).toBe(true);
  });

  it('endMatch switches to ended', () => {
    const app = new AppState();
    app.enterMatch();
    expect(app.endMatch()).toBe(true);
    expect(app.state).toBe('ended');
    expect(app.inMatch).toBe(false);
  });

  it('cannot end a match that has not started', () => {
    const app = new AppState();
    expect(app.endMatch()).toBe(false);
    expect(app.state).toBe('menu');
  });

  it('cannot enter the match twice or after it ended', () => {
    const app = new AppState();
    app.enterMatch();
    expect(app.enterMatch()).toBe(false);
    app.endMatch();
    expect(app.enterMatch()).toBe(false);
    expect(app.state).toBe('ended');
  });

  it('emits an event for each change and none for a refused one', () => {
    const events = new EventBus();
    const seen: string[] = [];
    events.on('appstate', ({ from, to }) => seen.push(`${from}>${to}`));
    const app = new AppState(events);
    app.endMatch();
    app.enterMatch();
    app.enterMatch();
    app.endMatch();
    expect(seen).toEqual(['menu>match', 'match>ended']);
  });
});
