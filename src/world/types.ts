/** Axis-aligned rectangle on the ground plane, centered at (cx, cz). */
export interface Rect {
  cx: number;
  cz: number;
  /** Size along x. */
  width: number;
  /** Size along z. */
  depth: number;
}

export interface Street extends Rect {
  orientation: 'north-south' | 'east-west';
}

export interface Point {
  x: number;
  z: number;
}

export interface River {
  /** Centerline from north to south, one point per sample step. */
  centerline: Point[];
  width: number;
}

export type BridgeId = 'han' | 'dragon' | 'tranThiLy';

export interface Bridge {
  id: BridgeId;
  /** Deck center line runs along x at this z. */
  z: number;
  deckWidth: number;
  /** West and east ends of the deck including ramps. */
  xStart: number;
  xEnd: number;
  rampLength: number;
}

export type LandmarkId = 'hanMarket' | 'cockChurch' | 'chamMuseum' | 'dragonBridge';

export interface Landmark {
  id: LandmarkId;
  area: Rect;
}

export interface Layout {
  size: number;
  streets: Street[];
  river: River;
  bridges: Bridge[];
  landmarks: Landmark[];
}
