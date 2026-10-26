import { describe, expect, it } from 'vitest';
import type { MatchSummary } from '../systems/match-stats';
import { endLine, resultRows } from './end-screen-lines';

const summary = (extra: Partial<MatchSummary> = {}): MatchSummary => ({
  rank: 7,
  kills: 3,
  damageDealt: 215,
  survivalSeconds: 154,
  won: false,
  cause: 'shot',
  ...extra,
});

describe('endLine', () => {
  it('has a win line that mentions mi Quang', () => {
    const line = endLine(summary({ won: true, cause: null, rank: 1 }));
    expect(line).toContain('Chiến thắng');
    expect(line).toContain('mì Quảng');
  });

  it('has a line for being shot', () => {
    const line = endLine(summary({ cause: 'shot' }));
    expect(line).toContain('hạ gục');
  });

  it('has a line for the flood', () => {
    const line = endLine(summary({ cause: 'flood' }));
    expect(line).toContain('Nước lũ');
  });

  it('gives three different lines, in a cartoon voice without gore', () => {
    const lines = [
      endLine(summary({ won: true, cause: null })),
      endLine(summary({ cause: 'shot' })),
      endLine(summary({ cause: 'flood' })),
    ];
    expect(new Set(lines).size).toBe(3);
    for (const line of lines) expect(line).not.toMatch(/máu|chết|xác/i);
  });
});

describe('resultRows', () => {
  it('lists rank, kills, damage and survival time', () => {
    const { rows } = resultRows(summary(), 20);
    expect(rows).toEqual([
      ['Hạng', '#7/20'],
      ['Hạ gục', '3'],
      ['Sát thương gây ra', '215'],
      ['Thời gian sống sót', '2:34'],
    ]);
  });

  it('titles a win and a loss differently', () => {
    expect(resultRows(summary({ won: true, rank: 1 }), 20).title).toBe('Bạn thắng!');
    expect(resultRows(summary(), 20).title).toBe('Hết trận');
  });

  it('shows rank 1 for the winner', () => {
    expect(resultRows(summary({ won: true, rank: 1 }), 20).rows[0]).toEqual(['Hạng', '#1/20']);
  });
});
