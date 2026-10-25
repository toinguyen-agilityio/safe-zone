import type { Pause } from '../../core/pause';
import type { UiContext } from '../mount';
import './pause.css';

export interface PauseControllerOptions {
  pause: Pause;
  requestPointerLock: () => void;
  show: () => void;
  hide: () => void;
}

/** The pause rules, free of the page so they can be tested with a fake game. */
export class PauseController {
  private wasLocked = false;

  constructor(private readonly options: PauseControllerOptions) {}

  /** Losing the mouse capture (Esc) pauses, but only after the player has been in the match. */
  onPointerLock(locked: boolean): void {
    if (locked) {
      this.wasLocked = true;
      if (this.options.pause.paused) {
        this.options.pause.resume();
        this.options.hide();
      }
      return;
    }
    if (!this.wasLocked) return;
    this.options.pause.pause();
    this.options.show();
  }

  /** A click on the pause screen continues the match and captures the mouse again. */
  onClick(): void {
    if (!this.options.pause.paused) return;
    this.options.pause.resume();
    this.options.hide();
    this.options.requestPointerLock();
  }
}

export function mount(ctx: UiContext): () => void {
  const screen = document.createElement('div');
  screen.className = 'pause-screen ui-interactive';

  const title = document.createElement('h1');
  title.textContent = 'Tạm dừng';
  const hint = document.createElement('p');
  hint.textContent = 'Nhấn vào màn hình để tiếp tục';
  screen.append(title, hint);
  ctx.root.appendChild(screen);

  const controller = new PauseController({
    pause: ctx.pause,
    requestPointerLock: ctx.requestPointerLock,
    show: () => (screen.style.display = 'flex'),
    hide: () => (screen.style.display = 'none'),
  });
  const onClick = () => controller.onClick();
  screen.addEventListener('click', onClick);
  const stopListening = ctx.events.on('pointerlock', ({ locked }) =>
    controller.onPointerLock(locked),
  );

  return () => {
    stopListening();
    screen.removeEventListener('click', onClick);
    screen.remove();
  };
}
