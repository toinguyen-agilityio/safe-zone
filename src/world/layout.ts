import { config } from '../config';
import type { Bridge, Landmark, Layout, Point, River, Street } from './types';

const { world } = config;
const half = world.mapSize / 2;

/** x of the river centerline at a given z. */
export function riverCenterX(z: number): number {
  const { baseX, curveAmplitude, curveLength } = world.river;
  return baseX + curveAmplitude * Math.sin(z / curveLength);
}

function buildRiver(): River {
  const { sampleStep, width } = world.river;
  const centerline: Point[] = [];
  // Run past both map edges so no gap shows at the border.
  for (let z = -half - sampleStep; z <= half + sampleStep; z += sampleStep) {
    centerline.push({ x: riverCenterX(z), z });
  }
  return { centerline, width };
}

function buildStreets(): Street[] {
  const streets: Street[] = [];
  for (const x of world.streetXs) {
    streets.push({
      orientation: 'north-south',
      cx: x,
      cz: 0,
      width: world.streetWidth,
      depth: world.mapSize,
    });
  }
  const startX = -half;
  const length = world.streetEastEnd - startX;
  for (const z of world.streetZs) {
    streets.push({
      orientation: 'east-west',
      cx: startX + length / 2,
      cz: z,
      width: length,
      depth: world.streetWidth,
    });
  }
  return streets;
}

function buildBridges(): Bridge[] {
  const halfRiver = world.river.width / 2;
  const entries = Object.entries(world.bridgeZs) as [Bridge['id'], number][];
  return entries.map(([id, z]) => {
    const cx = riverCenterX(z);
    return {
      id,
      z,
      deckWidth: world.bridgeDeckWidth,
      xStart: cx - halfRiver - world.bridgeRampLength,
      xEnd: cx + halfRiver + world.bridgeRampLength,
      rampLength: world.bridgeRampLength,
    };
  });
}

function buildLandmarks(): Landmark[] {
  return [
    { id: 'hanMarket', area: { cx: -40, cz: -40, width: 60, depth: 60 } },
    { id: 'cockChurch', area: { cx: -200, cz: 40, width: 50, depth: 50 } },
    { id: 'chamMuseum', area: { cx: 40, cz: 120, width: 60, depth: 50 } },
    {
      id: 'dragonBridge',
      area: {
        cx: riverCenterX(world.bridgeZs.dragon),
        cz: world.bridgeZs.dragon,
        width: 130,
        depth: 30,
      },
    },
  ];
}

export function getLayout(): Layout {
  return {
    size: world.mapSize,
    streets: buildStreets(),
    river: buildRiver(),
    bridges: buildBridges(),
    landmarks: buildLandmarks(),
  };
}
