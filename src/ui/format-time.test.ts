import { describe, expect, it } from 'vitest';
import { formatTime } from './format-time';

describe('formatTime', () => {
  it('shows minutes and two digit seconds', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(59)).toBe('0:59');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(65)).toBe('1:05');
    expect(formatTime(600)).toBe('10:00');
  });

  it('rounds a part of a second up, so the clock reaches 0:00 only at the end', () => {
    expect(formatTime(59.2)).toBe('1:00');
    expect(formatTime(0.1)).toBe('0:01');
    expect(formatTime(1.0)).toBe('0:01');
  });

  it('never shows a negative time', () => {
    expect(formatTime(-3)).toBe('0:00');
  });
});
