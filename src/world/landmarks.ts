import { config } from '../config';
import type { Layout, LandmarkId, Rect } from './types';

const { landmarks: settings } = config.world;

export type BuildingLandmarkId = Exclude<LandmarkId, 'dragonBridge'>;

const NAMES: Record<BuildingLandmarkId, string> = {
  hanMarket: 'Han Market',
  cockChurch: 'Cock Church',
  chamMuseum: 'Cham Museum',
};

export interface LandmarkSpec {
  id: BuildingLandmarkId;
  name: string;
  /** Ground area the building stands on. */
  footprint: Rect;
  height: number;
}

/** The three landmark buildings. The Dragon Bridge is a bridge and has no footprint here. */
export function getLandmarks(layout: Layout): LandmarkSpec[] {
  const specs: LandmarkSpec[] = [];
  for (const landmark of layout.landmarks) {
    if (landmark.id === 'dragonBridge') continue;
    specs.push({
      id: landmark.id,
      name: NAMES[landmark.id],
      footprint: landmark.area,
      height: settings.heights[landmark.id],
    });
  }
  return specs;
}

/** A landmark footprint grown by the open-ground margin; nothing else may be built inside. */
export function reservedArea(landmark: LandmarkSpec): Rect {
  return {
    cx: landmark.footprint.cx,
    cz: landmark.footprint.cz,
    width: landmark.footprint.width + 2 * settings.margin,
    depth: landmark.footprint.depth + 2 * settings.margin,
  };
}
