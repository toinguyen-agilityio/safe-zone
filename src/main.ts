import { Game } from './game';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app container');
}
const root: HTMLElement = container;

/** Build a game that replaces itself with a fresh one when the player asks to play again. */
function startGame(): Game {
  const game = new Game(root, () => {
    game.dispose();
    const next = startGame();
    // The replay button was a click, so the browser allows capturing the mouse right away.
    next.enterMatch();
    next.requestPointerLock();
  });
  game.start();
  return game;
}

const game = startGame();
// The page opens on the start screen. Add ?autostart to the address to skip it while developing.
if (new URLSearchParams(window.location.search).has('autostart')) game.enterMatch();
