import { config } from '../../config';
import { pickupMessage } from '../item-names-vi';
import type { UiContext } from '../mount';
import { BannerController } from './banner';
import './toast.css';

/** Whose pickups get a message: the player's own. */
const PLAYER_ID = 'player';

export function mount(ctx: UiContext): () => void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  ctx.root.appendChild(toast);

  // The same show-then-hide rules as the banner, for a shorter time.
  const controller = new BannerController(
    {
      show: (text) => {
        toast.textContent = text;
        toast.classList.add('toast-show');
      },
      hide: () => toast.classList.remove('toast-show'),
    },
    config.ui.toastSeconds,
  );
  const stopListening = ctx.events.on('pickup', ({ item, collector }) => {
    if (collector === PLAYER_ID) controller.announce(pickupMessage(item.type));
  });

  return () => {
    stopListening();
    controller.dispose();
    toast.remove();
  };
}
