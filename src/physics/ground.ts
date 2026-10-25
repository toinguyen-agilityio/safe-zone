import { config } from '../config';
import { bridgeSurfaceHeight, getBridges, type BridgeSpec } from '../world/bridges';
import { riverCenterX } from '../world/layout';
import type { Layout } from '../world/types';

const { world } = config;

/** Height of the ground itself, ignoring bridges: road level on land, the river bed in the river. */
function terrainHeight(x: number, z: number): number {
  const inRiver = Math.abs(x - riverCenterX(z)) <= world.river.width / 2;
  return inRiver ? -world.river.bedDepth : world.roadLevel;
}

function onBridge(spec: BridgeSpec, x: number, z: number): boolean {
  return Math.abs(z - spec.z) <= spec.deckWidth / 2 && x >= spec.rampStartX && x <= spec.rampEndX;
}

/**
 * Where the feet rest at a position, given how high they are now:
 * - on land: road level; in the river: the river bed
 * - over a bridge ramp or deck: the bridge surface, but only for someone standing on it (feet no
 *   lower than a step below the surface). Someone under the deck, say swimming, gets the river
 *   bed, so the deck never lifts them up.
 */
export function createGroundHeight(
  layout: Layout,
): (x: number, z: number, currentY: number) => number {
  const bridges = getBridges(layout);
  return (x, z, currentY) => {
    const ground = terrainHeight(x, z);
    for (const bridge of bridges) {
      if (!onBridge(bridge, x, z)) continue;
      const surface = bridgeSurfaceHeight(bridge, x);
      if (currentY >= surface - world.stepUpHeight) return Math.max(surface, ground);
    }
    return ground;
  };
}
