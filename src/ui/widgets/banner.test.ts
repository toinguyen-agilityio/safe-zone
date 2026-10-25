import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { config } from '../../config';
import { BannerController } from './banner';

const log: string[] = [];
const view = {
  show: (text: string) => log.push(`show:${text}`),
  hide: () => log.push('hide'),
};

beforeEach(() => {
  log.length = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('BannerController', () => {
  it('shows the text of an announcement', () => {
    const banner = new BannerController(view);
    banner.announce('Nước đang dâng!');
    expect(log).toEqual(['show:Nước đang dâng!']);
  });

  it('hides it after the configured time', () => {
    const banner = new BannerController(view);
    banner.announce('Vùng khô mới đã xuất hiện!');
    vi.advanceTimersByTime(config.ui.bannerSeconds * 1000 - 1);
    expect(log).toEqual(['show:Vùng khô mới đã xuất hiện!']);
    vi.advanceTimersByTime(1);
    expect(log).toEqual(['show:Vùng khô mới đã xuất hiện!', 'hide']);
  });

  it('lets a new message replace the old one and start the time again', () => {
    const banner = new BannerController(view);
    banner.announce('một');
    vi.advanceTimersByTime(3000);
    banner.announce('hai');
    vi.advanceTimersByTime(3000);
    expect(log).toEqual(['show:một', 'show:hai']);
    vi.advanceTimersByTime(config.ui.bannerSeconds * 1000);
    expect(log).toEqual(['show:một', 'show:hai', 'hide']);
  });

  it('does not hide after it has been disposed', () => {
    const banner = new BannerController(view);
    banner.announce('một');
    banner.dispose();
    vi.advanceTimersByTime(10_000);
    expect(log).toEqual(['show:một']);
  });

  it('uses the time it is given', () => {
    const banner = new BannerController(view, 1);
    banner.announce('nhanh');
    vi.advanceTimersByTime(1000);
    expect(log).toEqual(['show:nhanh', 'hide']);
  });
});
