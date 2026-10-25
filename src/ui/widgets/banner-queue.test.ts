import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../../config';
import { BannerController } from './banner';

const log: string[] = [];
const view = {
  show: (text: string) => log.push(`show:${text}`),
  hide: () => log.push('hide'),
};
const MS = config.ui.bannerSeconds * 1000;
const queued = () =>
  new BannerController(view, config.ui.bannerSeconds, undefined, { queue: true });

beforeEach(() => {
  log.length = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('BannerController queue', () => {
  it('shows banners one after another instead of replacing the one on screen', () => {
    const banner = queued();
    banner.announce('một');
    banner.announce('hai');
    banner.announce('ba');
    expect(log).toEqual(['show:một']);
    expect(banner.pending).toBe(2);

    vi.advanceTimersByTime(MS);
    expect(log).toEqual(['show:một', 'show:hai']);
    vi.advanceTimersByTime(MS);
    expect(log).toEqual(['show:một', 'show:hai', 'show:ba']);
    vi.advanceTimersByTime(MS);
    expect(log).toEqual(['show:một', 'show:hai', 'show:ba', 'hide']);
    expect(banner.pending).toBe(0);
    expect(banner.showing).toBe(false);
  });

  it('gives every banner its full time', () => {
    const banner = queued();
    banner.announce('một');
    banner.announce('hai');
    vi.advanceTimersByTime(MS - 1);
    expect(log).toEqual(['show:một']);
    vi.advanceTimersByTime(1 + MS - 1);
    expect(log).toEqual(['show:một', 'show:hai']);
  });

  it('shows a new banner at once when the screen is free', () => {
    const banner = queued();
    banner.announce('một');
    vi.advanceTimersByTime(MS);
    expect(log).toEqual(['show:một', 'hide']);
    banner.announce('hai');
    expect(log).toEqual(['show:một', 'hide', 'show:hai']);
  });

  it('does not let the queue grow without limit', () => {
    const banner = new BannerController(view, 1, undefined, { queue: true, maxWaiting: 2 });
    for (const text of ['a', 'b', 'c', 'd', 'e']) banner.announce(text);
    expect(banner.pending).toBe(2);
    vi.advanceTimersByTime(3000);
    // The first one, then the latest two.
    expect(log.filter((l) => l.startsWith('show:'))).toEqual(['show:a', 'show:d', 'show:e']);
  });

  it('forgets what is waiting when disposed', () => {
    const banner = queued();
    banner.announce('một');
    banner.announce('hai');
    banner.dispose();
    vi.advanceTimersByTime(MS * 3);
    expect(log).toEqual(['show:một']);
    expect(banner.pending).toBe(0);
  });

  it('keeps replacing when queueing is not asked for, as the toast does', () => {
    const banner = new BannerController(view);
    banner.announce('một');
    banner.announce('hai');
    expect(log).toEqual(['show:một', 'show:hai']);
    expect(banner.pending).toBe(0);
  });
});
