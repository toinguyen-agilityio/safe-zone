import { Game } from './game';

/**
 * Build a game in `root` that replaces itself with a fresh one when the player asks to play
 * again. `observe` is told about every game that starts, the first and each replay.
 */
export function startGame(root: HTMLElement, observe?: (game: Game) => void): Game {
  const game = new Game(root, () => {
    game.dispose();
    const next = startGame(root, observe);
    // The replay button was a click, so the browser allows capturing the mouse right away.
    next.enterMatch();
    next.requestPointerLock();
  });
  game.start();
  observe?.(game);
  return game;
}
