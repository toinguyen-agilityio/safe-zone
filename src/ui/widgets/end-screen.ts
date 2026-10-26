import { PLAYERS_AT_START } from '../../systems/match-stats';
import { endLine, resultRows } from '../end-screen-lines';
import type { UiContext } from '../mount';
import './end-screen.css';

export const REPLAY_BUTTON = 'Chơi lại';

export function mount(ctx: UiContext): () => void {
  const screen = document.createElement('div');
  screen.className = 'end-screen ui-interactive';
  ctx.root.appendChild(screen);

  const fill = () => {
    const result = ctx.results?.();
    if (!result) return false;
    const { title, rows } = resultRows(result, PLAYERS_AT_START);

    const heading = document.createElement('h1');
    heading.textContent = title;
    const line = document.createElement('p');
    line.className = 'end-screen-line';
    line.textContent = endLine(result);
    const table = document.createElement('div');
    table.className = 'end-screen-rows';
    for (const [label, value] of rows) {
      const name = document.createElement('span');
      name.textContent = label;
      const number = document.createElement('span');
      number.className = 'end-screen-value';
      number.textContent = value;
      table.append(name, number);
    }
    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'end-screen-replay';
    replay.textContent = REPLAY_BUTTON;
    // The replay itself comes later; the button asks the app for it when it can.
    replay.addEventListener('click', () => ctx.app?.replay?.());
    screen.replaceChildren(heading, line, table, replay);
    return true;
  };

  const stopListening = ctx.events.on('appstate', ({ to }) => {
    if (to === 'ended') {
      // Give the mouse back so the buttons can be clicked.
      document.exitPointerLock?.();
      if (fill()) screen.classList.add('end-screen-show');
    } else {
      screen.classList.remove('end-screen-show');
    }
  });

  return () => {
    stopListening();
    screen.remove();
  };
}
