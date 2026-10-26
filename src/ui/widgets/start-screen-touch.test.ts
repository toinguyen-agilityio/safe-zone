import { describe, expect, it } from 'vitest';
import { AppState } from '../../core/app-state';
import { EventBus } from '../../core/events';
import { TOUCH_NOTICE } from '../text-vi';
import { startScreenMode } from './start-screen';

describe('startScreenMode', () => {
  it('shows a Vietnamese notice and no enter button on a touch device', () => {
    const mode = startScreenMode(true);
    expect(mode.showButton).toBe(false);
    expect(mode.notice).toBe(TOUCH_NOTICE);
    expect(TOUCH_NOTICE).toContain('cảm ứng');
  });

  it('shows the button and no notice on a desktop', () => {
    expect(startScreenMode(false)).toEqual({ showButton: true, notice: null });
  });
});

describe('entering the match on a touch device', () => {
  it('does nothing: the app stays in the menu', () => {
    const app = new AppState(new EventBus(), () => false);
    expect(app.enterMatch()).toBe(false);
    expect(app.state).toBe('menu');
    expect(app.inMatch).toBe(false);
  });

  it('sends no state change event when it refuses', () => {
    const events = new EventBus();
    const seen: string[] = [];
    events.on('appstate', ({ to }) => seen.push(to));
    new AppState(events, () => false).enterMatch();
    expect(seen).toEqual([]);
  });

  it('works as before on a desktop', () => {
    const app = new AppState(new EventBus(), () => true);
    expect(app.enterMatch()).toBe(true);
    expect(app.state).toBe('match');
  });

  it('can start later if the device changes its mind, as long as it is still in the menu', () => {
    let touch = true;
    const app = new AppState(undefined, () => !touch);
    expect(app.enterMatch()).toBe(false);
    touch = false;
    expect(app.enterMatch()).toBe(true);
  });
});
