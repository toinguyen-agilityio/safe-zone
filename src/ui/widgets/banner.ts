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

export interface BannerOptions {
  /** A message that arrives while another shows waits its turn instead of replacing it. */
  queue?: boolean;
  /** Most messages waiting at once; the oldest are dropped past it. */
  maxWaiting?: number;
}

/**
 * The banner rules, free of the page so they can be tested: a message shows its text, then hides
 * after the configured time. By default a new message replaces the old one and starts the time
 * again; with `queue` it waits until the one on screen has had its time.
 */
export class BannerController {
  private handle: unknown = null;
  private readonly waiting: string[] = [];
  private readonly queue: boolean;
  private readonly maxWaiting: number;

  constructor(
    private readonly view: BannerView,
    private readonly seconds: number = config.ui.bannerSeconds,
    private readonly timers: Timers = REAL_TIMERS,
    options: BannerOptions = {},
  ) {
    this.queue = options.queue ?? false;
    this.maxWaiting = options.maxWaiting ?? 5;
  }

  /** True while a message is on the screen. */
  get showing(): boolean {
    return this.handle !== null;
  }

  /** How many messages are waiting their turn. */
  get pending(): number {
    return this.waiting.length;
  }

  announce(text: string): void {
    if (this.queue && this.handle !== null) {
      this.waiting.push(text);
      while (this.waiting.length > this.maxWaiting) this.waiting.shift();
      return;
    }
    if (this.handle !== null) this.timers.clear(this.handle);
    this.display(text);
  }

  private display(text: string): void {
    this.view.show(text);
    this.handle = this.timers.set(() => {
      this.handle = null;
      const next = this.waiting.shift();
      if (next === undefined) this.view.hide();
      else this.display(next);
    }, this.seconds * 1000);
  }

  /** Stop the timer and forget what is waiting, for example when the widget is removed. */
  dispose(): void {
    if (this.handle !== null) this.timers.clear(this.handle);
    this.handle = null;
    this.waiting.length = 0;
  }
}

export function mount(ctx: UiContext): () => void {
  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.setAttribute('role', 'status');
  ctx.root.appendChild(banner);

  // Announcements that come close together are shown one after another.
  const controller = new BannerController(
    {
      show: (text) => {
        banner.textContent = text;
        banner.classList.add('banner-show');
      },
      hide: () => banner.classList.remove('banner-show'),
    },
    config.ui.bannerSeconds,
    undefined,
    { queue: true },
  );
  const stopListening = ctx.events.on('announce', ({ text }) => controller.announce(text));

  return () => {
    stopListening();
    controller.dispose();
    banner.remove();
  };
}
