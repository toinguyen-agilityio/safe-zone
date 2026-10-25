import { describe, expect, it } from 'vitest';
import { config } from '../config';
import type { KillRecord } from '../systems/kill-log';
import { FLOOD_NAME, KillFeedModel } from './kill-feed-model';

const shot = (killer: string, victim: string): KillRecord => ({
  killer,
  victim,
  cause: 'shot',
  time: 1,
});

const names: Record<string, string> = {
  player: 'Bạn',
  'bot-1': 'Anh Ba Xe Ôm',
  'bot-2': 'Cô Năm Mì Quảng',
};
const nameOf = (id: string) => names[id] ?? id;

describe('KillFeedModel', () => {
  it('adds a line with the killer and victim names', () => {
    const feed = new KillFeedModel(nameOf);
    feed.add(shot('bot-1', 'bot-2'));
    expect(feed.lines).toEqual([
      { killer: 'Anh Ba Xe Ôm', victim: 'Cô Năm Mì Quảng', cause: 'shot', involvesPlayer: false },
    ]);
  });

  it('keeps only the latest 5 lines, oldest first', () => {
    const feed = new KillFeedModel(nameOf);
    expect(config.ui.killFeedMax).toBe(5);
    for (let i = 1; i <= 8; i++) feed.add(shot('bot-1', `bot-${i + 10}`));
    expect(feed.lines).toHaveLength(5);
    expect(feed.lines.map((l) => l.victim)).toEqual([
      'bot-14',
      'bot-15',
      'bot-16',
      'bot-17',
      'bot-18',
    ]);
  });

  it('names the flood when it kills, with no killer', () => {
    const feed = new KillFeedModel(nameOf);
    feed.add({ killer: null, victim: 'bot-1', cause: 'flood', time: 9 });
    expect(feed.lines[0]).toMatchObject({
      killer: FLOOD_NAME,
      victim: 'Anh Ba Xe Ôm',
      cause: 'flood',
    });
  });

  it('marks the lines the player is in', () => {
    const feed = new KillFeedModel(nameOf);
    feed.add(shot('player', 'bot-1'));
    feed.add(shot('bot-2', 'player'));
    feed.add(shot('bot-1', 'bot-2'));
    expect(feed.lines.map((l) => l.involvesPlayer)).toEqual([true, true, false]);
  });

  it('uses the id when a name is not known', () => {
    const feed = new KillFeedModel();
    feed.add(shot('bot-7', 'bot-8'));
    expect(feed.lines[0]).toMatchObject({ killer: 'bot-7', victim: 'bot-8' });
  });

  it('can be told to keep another number of lines', () => {
    const feed = new KillFeedModel(nameOf, 2);
    for (let i = 0; i < 4; i++) feed.add(shot('bot-1', 'bot-2'));
    expect(feed.lines).toHaveLength(2);
  });
});
