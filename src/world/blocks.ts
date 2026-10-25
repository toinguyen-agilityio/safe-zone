import { riverCenterX } from './layout';
import { getLandmarks, reservedArea } from './landmarks';
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

/** What is left of a block after cutting a rectangular hole out of it, as up to four strips. */
function subtract(block: Rect, hole: Rect): Rect[] {
  const b = {
    x0: block.cx - block.width / 2,
    x1: block.cx + block.width / 2,
    z0: block.cz - block.depth / 2,
    z1: block.cz + block.depth / 2,
  };
  const h = {
    x0: hole.cx - hole.width / 2,
    x1: hole.cx + hole.width / 2,
    z0: hole.cz - hole.depth / 2,
    z1: hole.cz + hole.depth / 2,
  };
  if (h.x0 >= b.x1 || h.x1 <= b.x0 || h.z0 >= b.z1 || h.z1 <= b.z0) return [block];

  const pieces: Rect[] = [];
  const add = (x0: number, x1: number, z0: number, z1: number) => {
    if (x1 - x0 > 1e-9 && z1 - z0 > 1e-9) pieces.push(rectFromBounds(x0, x1, z0, z1));
  };
  const hx0 = Math.max(h.x0, b.x0);
  const hx1 = Math.min(h.x1, b.x1);
  add(b.x0, hx0, b.z0, b.z1);
  add(hx1, b.x1, b.z0, b.z1);
  add(hx0, hx1, b.z0, Math.max(h.z0, b.z0));
  add(hx0, hx1, Math.min(h.z1, b.z1), b.z1);
  return pieces;
}

/**
 * Rectangular blocks between the streets, west of the river. The strip next to the
 * river stops at the lowest bank point of each row and leaves bridge decks free.
 * Land east of the river is left empty. Landmark footprints are cut out of the blocks.
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
    if (!nextToRiver) continue;
    // East-west streets end before the river, so the land past their ends is also a block.
    for (const street of eastWest) {
      const start = Math.max(x0, street.cx + street.width / 2);
      const band: Interval = [street.cz - street.depth / 2, street.cz + street.depth / 2];
      for (const [bz0, bz1] of gaps(bridgeBands, band[0], band[1])) {
        const east = westBankMin(layout, bz0, bz1);
        if (east > start) blocks.push(rectFromBounds(start, east, bz0, bz1));
      }
    }
  }
  const holes = getLandmarks(layout).map(reservedArea);
  return holes.reduce((current, hole) => current.flatMap((block) => subtract(block, hole)), blocks);
}
