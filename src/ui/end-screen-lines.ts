import type { MatchSummary } from '../systems/match-stats';
import { formatTime } from './format-time';

/** The cartoon line shown under the result: the win, being shot or the flood. No gore. */
export function endLine(result: Pick<MatchSummary, 'won' | 'cause'>): string {
  if (result.won) return 'Chiến thắng! Xứng đáng một tô mì Quảng nóng hổi!';
  if (result.cause === 'flood')
    return 'Nước lũ cuốn bạn đi mất rồi! Lần sau nhớ chạy vào vùng khô nhé.';
  return 'Bạn bị hạ gục! Thôi, ăn tô mì Quảng cho đỡ buồn rồi chơi lại nào.';
}

export interface ResultRows {
  title: string;
  rows: readonly (readonly [label: string, value: string])[];
}

/** What the end screen lists, in Vietnamese. */
export function resultRows(result: MatchSummary, total: number): ResultRows {
  return {
    title: result.won ? 'Bạn thắng!' : 'Hết trận',
    rows: [
      ['Hạng', `#${result.rank}/${total}`],
      ['Hạ gục', `${result.kills}`],
      ['Sát thương gây ra', `${result.damageDealt}`],
      ['Thời gian sống sót', formatTime(result.survivalSeconds)],
    ],
  };
}
