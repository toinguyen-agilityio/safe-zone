import { Game } from './game';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Missing #app container');
}

const game = new Game(container);
game.start();
// The page opens in the menu. Until the start screen has its button, the match begins at once;
// add ?menu to the address to stay in the menu.
if (!new URLSearchParams(window.location.search).has('menu')) game.enterMatch();
