import { describe, expect, it } from 'vitest';
import { Pause } from '../../core/pause';
import { PauseController } from './pause';

const setup = () => {
  const pause = new Pause();
  const log: string[] = [];
  const controller = new PauseController({
    pause,
    requestPointerLock: () => log.push('lock'),
    show: () => log.push('show'),
    hide: () => log.push('hide'),
  });
  return { pause, log, controller };
};

describe('PauseController', () => {
  it('does not pause before the player has ever captured the mouse', () => {
    const { pause, log, controller } = setup();
    controller.onPointerLock(false);
    expect(pause.paused).toBe(false);
    expect(log).toEqual([]);
  });

  it('pauses and shows the screen when the mouse is released during a match', () => {
    const { pause, log, controller } = setup();
    controller.onPointerLock(true);
    controller.onPointerLock(false);
    expect(pause.paused).toBe(true);
    expect(log).toEqual(['show']);
  });

  it('continues, hides the screen and captures the mouse again on click', () => {
    const { pause, log, controller } = setup();
    controller.onPointerLock(true);
    controller.onPointerLock(false);
    controller.onClick();
    expect(pause.paused).toBe(false);
    expect(log).toEqual(['show', 'hide', 'lock']);
  });

  it('ignores a click when the game is not paused', () => {
    const { pause, log, controller } = setup();
    controller.onClick();
    expect(pause.paused).toBe(false);
    expect(log).toEqual([]);
  });

  it('pauses again after a second release', () => {
    const { pause, controller } = setup();
    controller.onPointerLock(true);
    controller.onPointerLock(false);
    controller.onClick();
    controller.onPointerLock(true);
    controller.onPointerLock(false);
    expect(pause.paused).toBe(true);
  });

  it('hides the screen if the mouse is captured again some other way', () => {
    const { pause, log, controller } = setup();
    controller.onPointerLock(true);
    controller.onPointerLock(false);
    controller.onPointerLock(true);
    expect(pause.paused).toBe(false);
    expect(log).toEqual(['show', 'hide']);
  });
});
