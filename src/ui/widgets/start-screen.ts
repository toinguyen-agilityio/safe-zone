import {
  CONTROLS,
  CONTROLS_TITLE,
  DESCRIPTION,
  ENTER_BUTTON,
  GAME_NAME,
  TAGLINE,
  TOUCH_NOTICE,
} from '../text-vi';
import type { UiContext } from '../mount';
import './start-screen.css';

export interface StartScreenOptions {
  /** Start the match; false when it cannot start. */
  enterMatch: () => boolean;
  /** Capture the mouse, which the browser only allows from a click. */
  requestPointerLock: () => void;
  hide: () => void;
}

/** What clicking the enter button does, free of the page so it can be tested. */
export class StartScreenController {
  constructor(private readonly options: StartScreenOptions) {}

  onEnter(): void {
    if (!this.options.enterMatch()) return;
    this.options.hide();
    this.options.requestPointerLock();
  }
}

export interface StartScreenMode {
  /** The enter button is shown. */
  showButton: boolean;
  /** The notice that takes its place, or null. */
  notice: string | null;
}

/** On a touch device there is a notice and no way in; on a desktop there is the button. */
export function startScreenMode(touch: boolean): StartScreenMode {
  return touch ? { showButton: false, notice: TOUCH_NOTICE } : { showButton: true, notice: null };
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

export function mount(ctx: UiContext): () => void {
  const screen = element('div', 'start-screen ui-interactive');
  const title = element('h1', '', GAME_NAME);
  const tagline = element('p', 'start-screen-tagline', TAGLINE);
  const description = element('p', 'start-screen-description', DESCRIPTION);

  const controls = element('div', 'start-screen-controls');
  controls.appendChild(element('h2', '', CONTROLS_TITLE));
  for (const [key, action] of CONTROLS) {
    controls.append(element('span', 'start-screen-key', key), element('span', '', action));
  }

  const enter = element('button', 'start-screen-enter', ENTER_BUTTON);
  enter.type = 'button';
  const mode = startScreenMode(Boolean(ctx.touch));
  if (mode.showButton) screen.append(title, tagline, description, controls, enter);
  else {
    screen.append(title, tagline, description, controls);
    screen.append(element('p', 'start-screen-notice', mode.notice ?? ''));
  }
  ctx.root.appendChild(screen);

  const show = () => screen.classList.add('start-screen-show');
  const hide = () => screen.classList.remove('start-screen-show');
  // The page opens on the start screen; with no app to start, there is nothing to show.
  if (ctx.app?.state === 'menu') show();

  const controller = new StartScreenController({
    enterMatch: () => ctx.app?.enterMatch() ?? false,
    requestPointerLock: ctx.requestPointerLock,
    hide,
  });
  const onClick = () => controller.onEnter();
  enter.addEventListener('click', onClick);
  // If the match starts some other way, the screen goes away too.
  const stopListening = ctx.events.on('appstate', ({ to }) => {
    if (to !== 'menu') hide();
  });

  return () => {
    stopListening();
    enter.removeEventListener('click', onClick);
    screen.remove();
  };
}
