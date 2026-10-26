import { config } from '../config';
import { createRng, type Rng } from '../core/rng';
import { computeBlocks } from './blocks';
import { riverCenterX } from './layout';
import type { Layout, Rect } from './types';

const { houses: settings } = config.world;

export interface House extends Rect {
  height: number;
}

export interface HouseLayout {
  /** Tube houses (nha ong): narrow frontage, long depth, built in two back-to-back rows. */
  houses: House[];
  /** Alleys (kiet) that cross a block between houses. */
  alleys: Rect[];
}

/** A strip of a block, given along the block's long axis (u) and across it (v). */
function strip(
  block: Rect,
  alongX: boolean,
  u: number,
  uLen: number,
  v: number,
  vLen: number,
): Rect {
  return alongX
    ? { cx: block.cx + u + uLen / 2, cz: block.cz + v + vLen / 2, width: uLen, depth: vLen }
    : { cx: block.cx + v + vLen / 2, cz: block.cz + u + uLen / 2, width: vLen, depth: uLen };
}

function fillBlock(block: Rect, rng: Rng, out: { houses: Rect[]; alleys: Rect[] }): void {
  const alongX = block.width >= block.depth;
  const length = (alongX ? block.width : block.depth) - 2 * settings.margin;
  const across = (alongX ? block.depth : block.width) - 2 * settings.margin;
  if (length < settings.minFrontage || across <= 0) return;

  const end = -length / 2 + length;
  const rowDepth = across / 2;
  let u = -length / 2;
  let built = 0;
  let alleyAfter = rng.int(settings.alleyEveryMin, settings.alleyEveryMax);

  while (u < end) {
    const remaining = end - u;
    if (built >= alleyAfter && remaining >= settings.alleyWidth + settings.minFrontage) {
      out.alleys.push(strip(block, alongX, u, settings.alleyWidth, -across / 2, across));
      u += settings.alleyWidth;
      built = 0;
      alleyAfter = rng.int(settings.alleyEveryMin, settings.alleyEveryMax);
      continue;
    }
    let frontage =
      settings.frontageMin + rng.float() * (settings.frontageMax - settings.frontageMin);
    if (remaining - frontage < settings.minFrontage) frontage = remaining;
    if (frontage < settings.minFrontage) break;
    out.houses.push(strip(block, alongX, u, frontage, -across / 2, rowDepth));
    out.houses.push(strip(block, alongX, u, frontage, 0, rowDepth));
    u += frontage;
    built++;
  }
}

function pickHeight(range: { min: number; max: number }, rng: Rng): number {
  return range.min + rng.float() * (range.max - range.min);
}

/** Distance from a house's east edge to the river's west bank at the house's row. */
function distanceToRiver(house: Rect, halfRiver: number): number {
  return riverCenterX(house.cz) - halfRiver - (house.cx + house.width / 2);
}

/** The same seed always gives the same houses and alleys. */
export function generateHouses(layout: Layout, seed: number): HouseLayout {
  const rng = createRng(seed);
  const flat = { houses: [] as Rect[], alleys: [] as Rect[] };
  for (const block of computeBlocks(layout)) fillBlock(block, rng, flat);

  // Heights use their own stream so they never shift where houses stand.
  const heightRng = createRng(seed ^ 0x9e3779b9);
  const halfRiver = layout.river.width / 2;
  const houses = flat.houses.map((house): House => {
    const riverSide = distanceToRiver(house, halfRiver) <= settings.riverBand;
    const range = riverSide ? settings.riverHeight : settings.innerHeight;
    return { ...house, height: pickHeight(range, heightRng) };
  });
  return { houses, alleys: flat.alleys };
}
