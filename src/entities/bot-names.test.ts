import { describe, expect, it } from 'vitest';
import { createRng } from '../core/rng';
import { BOT_NAMES, pickBotNames } from './bot-names';

describe('BOT_NAMES', () => {
  it('has at least 25 names, all different and not empty', () => {
    expect(BOT_NAMES.length).toBeGreaterThanOrEqual(25);
    expect(new Set(BOT_NAMES).size).toBe(BOT_NAMES.length);
    for (const name of BOT_NAMES) expect(name.trim().length).toBeGreaterThan(0);
  });

  it('has no real brand names', () => {
    const brands = /pubg|garena|vinfast|vingroup|grab|highlands|starbucks|coca|pepsi|honda|yamaha/i;
    for (const name of BOT_NAMES) expect(name).not.toMatch(brands);
  });
});

describe('pickBotNames', () => {
  it('returns 19 unique names', () => {
    const names = pickBotNames(createRng(1), 19);
    expect(names).toHaveLength(19);
    expect(new Set(names).size).toBe(19);
    for (const name of names) expect(BOT_NAMES).toContain(name);
  });

  it('gives the same names for the same seed', () => {
    expect(pickBotNames(createRng(7), 19)).toEqual(pickBotNames(createRng(7), 19));
  });

  it('gives a different set or order for another seed', () => {
    expect(pickBotNames(createRng(7), 19)).not.toEqual(pickBotNames(createRng(8), 19));
  });

  it('can hand out every name once', () => {
    const names = pickBotNames(createRng(3), BOT_NAMES.length);
    expect([...names].sort()).toEqual([...BOT_NAMES].sort());
  });

  it('refuses to hand out more names than exist', () => {
    expect(() => pickBotNames(createRng(1), BOT_NAMES.length + 1)).toThrow();
  });

  it('returns nothing for zero', () => {
    expect(pickBotNames(createRng(1), 0)).toEqual([]);
  });
});
