import { startGame } from './app';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app container');
}

const game = startGame(container);
// The page opens on the start screen. Add ?autostart to the address to skip it while developing.
if (new URLSearchParams(window.location.search).has('autostart')) game.enterMatch();
