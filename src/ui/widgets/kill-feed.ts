import { KillFeedModel, type FeedLine } from '../kill-feed-model';
import type { UiContext } from '../mount';
import './kill-feed.css';

function lineElement(line: FeedLine): HTMLElement {
  const row = document.createElement('div');
  row.className = 'kill-feed-line';
  if (line.involvesPlayer) row.classList.add('kill-feed-mine');
  const killer = document.createElement('span');
  killer.textContent = line.killer;
  const arrow = document.createElement('span');
  arrow.className = 'kill-feed-arrow';
  arrow.textContent = '➜';
  const victim = document.createElement('span');
  victim.textContent = line.victim;
  row.append(killer, arrow, victim);
  return row;
}

export function mount(ctx: UiContext): () => void {
  const feed = document.createElement('div');
  feed.className = 'kill-feed';
  ctx.root.appendChild(feed);

  const model = new KillFeedModel(ctx.nameOf);
  const stopListening = ctx.events.on('kill', (kill) => {
    model.add(kill);
    feed.replaceChildren(...model.lines.map(lineElement));
  });

  return () => {
    stopListening();
    feed.remove();
  };
}
