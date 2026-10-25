import { config } from '../../config';
import type { UiContext } from '../mount';
import './banner.css';

export interface BannerView {
  show: (text: string) => void;
  hide: () => void;
}

type Timers = {
  set: (callback: () => void, ms: number) => unknown;
  clear: (handle: unknown) => void;
};

const REAL_TIMERS: Timers = {
  set: (callback, ms) => setTimeout(callback, ms),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

/**
 * The banner rules, free of the page so they can be tested: a message shows its text, then hides
 * after the configured time. A new message replaces the old one and starts the time again.
 */
export class BannerController {
  private handle: unknown = null;

  constructor(
    private readonly view: BannerView,
    private readonly seconds: number = config.ui.bannerSeconds,
    private readonly timers: Timers = REAL_TIMERS,
  ) {}

  announce(text: string): void {
    if (this.handle !== null) this.timers.clear(this.handle);
    this.view.show(text);
    this.handle = this.timers.set(() => {
      this.handle = null;
      this.view.hide();
    }, this.seconds * 1000);
  }

  /** Stop the timer, for example when the widget is removed. */
  dispose(): void {
    if (this.handle !== null) this.timers.clear(this.handle);
    this.handle = null;
  }
}

export function mount(ctx: UiContext): () => void {
  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.setAttribute('role', 'status');
  ctx.root.appendChild(banner);

  const controller = new BannerController({
    show: (text) => {
      banner.textContent = text;
      banner.classList.add('banner-show');
    },
    hide: () => banner.classList.remove('banner-show'),
  });
  const stopListening = ctx.events.on('announce', ({ text }) => controller.announce(text));

  return () => {
    stopListening();
    controller.dispose();
    banner.remove();
  };
}
