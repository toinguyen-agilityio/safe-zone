import { describe, expect, it } from 'vitest';
import { isTouchDevice, type DeviceEnv } from './device';

/** A browser that answers the media queries given and has this many touch points. */
function browser(queries: string[], maxTouchPoints = 0): DeviceEnv {
  return {
    matchMedia: (query) => ({ matches: queries.includes(query) }),
    navigator: { maxTouchPoints },
  };
}

describe('isTouchDevice', () => {
  it('is true for a phone or tablet with a coarse primary pointer', () => {
    expect(isTouchDevice(browser(['(pointer: coarse)', '(any-pointer: coarse)'], 5))).toBe(true);
  });

  it('is false on a desktop with a mouse', () => {
    expect(isTouchDevice(browser(['(pointer: fine)', '(any-pointer: fine)'], 0))).toBe(false);
  });

  it('is false on a laptop with a touch screen and a trackpad', () => {
    expect(
      isTouchDevice(
        browser(['(pointer: fine)', '(any-pointer: fine)', '(any-pointer: coarse)'], 10),
      ),
    ).toBe(false);
  });

  it('is true for a touch-only environment that does not report a coarse pointer', () => {
    expect(isTouchDevice(browser([], 3))).toBe(true);
  });

  it('is false when nothing says touch', () => {
    expect(isTouchDevice(browser([], 0))).toBe(false);
    expect(isTouchDevice({})).toBe(false);
  });

  it('copes with an environment without matchMedia', () => {
    expect(isTouchDevice({ navigator: { maxTouchPoints: 2 } })).toBe(true);
    expect(isTouchDevice({ navigator: {} })).toBe(false);
  });
});
