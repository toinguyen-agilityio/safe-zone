import { describe, expect, it } from 'vitest';
import { AppState } from '../../core/app-state';
import { CONTROLS, DESCRIPTION, ENTER_BUTTON, GAME_NAME, TAGLINE } from '../text-vi';
import { StartScreenController } from './start-screen';

function setup() {
  const app = new AppState();
  const log: string[] = [];
  const controller = new StartScreenController({
    enterMatch: () => {
      log.push('enter');
      return app.enterMatch();
    },
    requestPointerLock: () => log.push('lock'),
    hide: () => log.push('hide'),
  });
  return { app, log, controller };
}

describe('StartScreenController', () => {
  it('the button calls enterMatch, closes the screen and captures the mouse', () => {
    const { app, log, controller } = setup();
    controller.onEnter();
    expect(app.state).toBe('match');
    expect(log).toEqual(['enter', 'hide', 'lock']);
  });

  it('does nothing more when the match cannot start', () => {
    const { app, log, controller } = setup();
    app.enterMatch();
    log.length = 0;
    controller.onEnter();
    expect(log).toEqual(['enter']);
  });
});

describe('start screen text', () => {
  it('has a game name of its own and a Vietnamese description', () => {
    expect(GAME_NAME).toBe('Sinh Tồn Hải Châu');
    expect(GAME_NAME.toLowerCase()).not.toContain('pubg');
    expect(GAME_NAME.toLowerCase()).not.toContain('battlegrounds');
    expect(TAGLINE.length).toBeGreaterThan(10);
    expect(DESCRIPTION).toContain('nước');
    expect(ENTER_BUTTON).toBe('Vào trận');
  });

  it('lists every control', () => {
    const keys = CONTROLS.map(([key]) => key);
    for (const wanted of [
      'W A S D',
      'Shift',
      'Space',
      'Chuột trái',
      'Chuột phải',
      'R',
      '1',
      '2',
      'Esc',
    ]) {
      expect(keys).toContain(wanted);
    }
    for (const [, action] of CONTROLS) expect(action.length).toBeGreaterThan(0);
  });
});
