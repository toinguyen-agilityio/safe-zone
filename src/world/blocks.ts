import { riverCenterX } from './layout';
import type { Layout, Rect } from './types';

type Interval = [number, number];

/** Free stretches of [lo, hi] left after removing the given intervals. */
function gaps(blocked: Interval[], lo: number, hi: number): Interval[] {
  const sorted = [...blocked].sort((a, b) => a[0] - b[0]);
  const result: Interval[] = [];
  let cursor = lo;
  for (const [start, end] of sorted) {
    if (start > cursor) result.push([cursor, Math.min(start, hi)]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < hi) result.push([cursor, hi]);
  return result.filter(([a, b]) => b > a);
}

function rectFromBounds(x0: number, x1: number, z0: number, z1: number): Rect {
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, width: x1 - x0, depth: z1 - z0 };
}

/** West bank of the river, lowest x over a z range (sampled every unit). */
function westBankMin(layout: Layout, z0: number, z1: number): number {
  const half = layout.river.width / 2;
  let min = Infinity;
  for (let z = z0; z <= z1; z += 1) min = Math.min(min, riverCenterX(z) - half);
  return Math.min(min, riverCenterX(z1) - half);
}

/**
 * Rectangular blocks between the streets, west of the river. The strip next to the
 * river stops at the lowest bank point of each row and leaves bridge decks free.
 * Land east of the river is left empty.
 */
export function computeBlocks(layout: Layout): Rect[] {
  const half = layout.size / 2;
  const northSouth = layout.streets.filter((s) => s.orientation === 'north-south');
  const eastWest = layout.streets.filter((s) => s.orientation === 'east-west');

  const xGaps = gaps(
    northSouth.map((s): Interval => [s.cx - s.width / 2, s.cx + s.width / 2]),
    -half,
    half,
  );
  const zGaps = gaps(
    eastWest.map((s): Interval => [s.cz - s.depth / 2, s.cz + s.depth / 2]),
    -half,
    half,
  );

  const bridgeBands = layout.bridges.map((b): Interval => [
    b.z - b.deckWidth / 2,
    b.z + b.deckWidth / 2,
  ]);

  const blocks: Rect[] = [];
  for (const [x0, x1] of xGaps) {
    const nextToRiver = x1 >= half;
    for (const [z0, z1] of zGaps) {
      if (!nextToRiver) {
        blocks.push(rectFromBounds(x0, x1, z0, z1));
        continue;
      }
      for (const [bz0, bz1] of gaps(bridgeBands, z0, z1)) {
        const east = westBankMin(layout, bz0, bz1);
        if (east > x0) blocks.push(rectFromBounds(x0, east, bz0, bz1));
      }
    }
  }
  return blocks;
}
