import { config } from '../config';
import { riverCenterX } from './layout';
import type { Bridge, BridgeId, Layout } from './types';

const { world } = config;

const NAMES: Record<BridgeId, string> = {
  han: 'Han River Bridge',
  dragon: 'Dragon Bridge',
  tranThiLy: 'Tran Thi Ly Bridge',
};

export interface Pillar {
  x: number;
  z: number;
  radius: number;
  /** Bottom stands on the river bed, top meets the deck underside. */
  bottomY: number;
  topY: number;
}

export interface Railing {
  /** Runs along x from x0 to x1 at this z. */
  x0: number;
  x1: number;
  z: number;
  height: number;
}

export interface BridgeSpec {
  id: BridgeId;
  name: string;
  z: number;
  deckWidth: number;
  /** Height of the flat deck above the ground. */
  deckHeight: number;
  /** West ramp rises from the bank-side ground at `rampStartX` to the deck at `deckStartX`. */
  rampStartX: number;
  deckStartX: number;
  deckEndX: number;
  /** East ramp falls from the deck at `deckEndX` to the ground at `rampEndX`. */
  rampEndX: number;
  rampLength: number;
  pillars: Pillar[];
  railings: Railing[];
}

function specFor(bridge: Bridge, layout: Layout): BridgeSpec {
  const half = layout.river.width / 2;
  const cx = riverCenterX(bridge.z);
  const deckStartX = cx - half;
  const deckEndX = cx + half;

  const count = Math.max(1, Math.floor(layout.river.width / world.bridgePillarSpacing));
  const step = layout.river.width / count;
  const pillars: Pillar[] = Array.from({ length: count }, (_, i) => ({
    x: deckStartX + (i + 0.5) * step,
    z: bridge.z,
    radius: world.bridgePillarRadius,
    bottomY: -world.river.bedDepth,
    topY: world.bridgeDeckHeight,
  }));

  const railings: Railing[] = [-1, 1].map((side) => ({
    x0: bridge.xStart,
    x1: bridge.xEnd,
    z: bridge.z + (side * bridge.deckWidth) / 2,
    height: world.bridgeRailingHeight,
  }));

  return {
    id: bridge.id,
    name: NAMES[bridge.id],
    z: bridge.z,
    deckWidth: bridge.deckWidth,
    deckHeight: world.bridgeDeckHeight,
    rampStartX: bridge.xStart,
    deckStartX,
    deckEndX,
    rampEndX: bridge.xEnd,
    rampLength: bridge.rampLength,
    pillars,
    railings,
  };
}

export function getBridges(layout: Layout): BridgeSpec[] {
  return layout.bridges.map((bridge) => specFor(bridge, layout));
}
