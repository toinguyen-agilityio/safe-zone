import { describe, expect, it } from 'vitest';
import { clamp } from './math';

describe('clamp', () => {
  it('returns the value when inside the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it('returns min when below the range', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });
  it('returns max when above the range', () => {
    expect(clamp(42, 0, 10)).toBe(10);
  });
});
