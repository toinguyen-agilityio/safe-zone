import { describe, expect, it } from 'vitest';
import { BODY_COLOR, HEAD_COLOR, hitmarkerColor, showsHitmarker } from './hitmarker';

describe('hitmarkerColor', () => {
  it('is yellow for a head hit', () => {
    expect(hitmarkerColor('head')).toBe(HEAD_COLOR);
    expect(HEAD_COLOR).toBe('#ffd400');
  });

  it('is white for the torso and legs', () => {
    expect(hitmarkerColor('torso')).toBe(BODY_COLOR);
    expect(hitmarkerColor('legs')).toBe(BODY_COLOR);
  });
});

describe('showsHitmarker', () => {
  it('marks the hits the player landed only', () => {
    expect(showsHitmarker({ shooter: 'player' })).toBe(true);
    expect(showsHitmarker({ shooter: 'bot-1' })).toBe(false);
    expect(showsHitmarker({ shooter: null })).toBe(false);
  });
});
