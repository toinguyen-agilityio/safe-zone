import { CatmullRomCurve3, Group, Mesh, MeshStandardMaterial, TubeGeometry, Vector3 } from 'three';
import type { BridgeSpec } from '../world/bridges';

const BODY_COLOR = 0x2f9e5b;
const BODY_RADIUS = 1.5;
/** How far the body floats above the deck surface. */
const CLEARANCE = 3.2;
/** Gentle up-and-down and sideways waves that make the tube read as a dragon. */
const WAVE_HEIGHT = 1.3;
const WAVE_SIDE = 3;
const WAVES = 3;
const SAMPLES = 60;

/** Height of the bridge surface (ramps and deck) at x. */
function surfaceHeight(spec: BridgeSpec, x: number): number {
  if (x <= spec.rampStartX || x >= spec.rampEndX) return 0;
  if (x < spec.deckStartX) return ((x - spec.rampStartX) / spec.rampLength) * spec.deckHeight;
  if (x > spec.deckEndX) return ((spec.rampEndX - x) / spec.rampLength) * spec.deckHeight;
  return spec.deckHeight;
}

/**
 * The spine of the dragon from the tail end (t = 0) to the head end (t = 1), so the head and
 * tail tasks can place their parts at the two ends.
 */
export function dragonSpine(spec: BridgeSpec): CatmullRomCurve3 {
  const points: Vector3[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const x = spec.rampStartX + t * (spec.rampEndX - spec.rampStartX);
    const wave = Math.sin(t * Math.PI * 2 * WAVES);
    // Keep the body inside the railings: never wider than half the deck.
    const side = Math.min(WAVE_SIDE, spec.deckWidth / 2 - BODY_RADIUS - 1) * wave;
    const y = surfaceHeight(spec, x) + CLEARANCE + WAVE_HEIGHT * wave;
    points.push(new Vector3(x, y, spec.z + side));
  }
  return new CatmullRomCurve3(points);
}

/** A tube-shaped dragon body running along the bridge. */
export function buildDragon(spec: BridgeSpec): Group {
  const group = new Group();
  group.name = 'dragon';
  const body = new Mesh(
    new TubeGeometry(dragonSpine(spec), SAMPLES * 3, BODY_RADIUS, 12, false),
    new MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6 }),
  );
  body.name = 'dragon-body';
  group.add(body);
  return group;
}
