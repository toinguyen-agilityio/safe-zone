import {
  BoxGeometry,
  CatmullRomCurve3,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  TubeGeometry,
  Vector3,
} from 'three';
import { config } from '../config';
import { bridgeSurfaceHeight, type BridgeSpec } from '../world/bridges';

const { dragon } = config.world;

const BODY_COLOR = 0x2f9e5b;
const HEAD_COLOR = 0xd9482b;
const HORN_COLOR = 0xf2c14e;
const TAIL_COLOR = 0x1f7a44;
const BODY_RADIUS = dragon.bodyRadius;
const CLEARANCE = dragon.clearance;
/** Gentle up-and-down and sideways waves that make the tube read as a dragon. */
const WAVE_HEIGHT = 1.3;
const WAVE_SIDE = 3;
const WAVES = 3;
const SAMPLES = 60;

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
    const y = bridgeSurfaceHeight(spec, x) + CLEARANCE + WAVE_HEIGHT * wave;
    points.push(new Vector3(x, y, spec.z + side));
  }
  return new CatmullRomCurve3(points);
}

/** Head at the end of the spine: a blocky skull, a snout and two gold horns. */
function buildHead(spine: CatmullRomCurve3): Group {
  const head = new Group();
  head.name = 'dragon-head';
  const material = new MeshStandardMaterial({ color: HEAD_COLOR, roughness: 0.5 });
  const size = BODY_RADIUS * 2.6;

  const skull = new Mesh(new BoxGeometry(dragon.headLength, size, size * 1.2), material);
  skull.name = 'dragon-skull';
  skull.position.x = dragon.headLength / 2;
  head.add(skull);

  const snout = new Mesh(
    new BoxGeometry(dragon.headLength * 0.5, size * 0.6, size * 0.8),
    material,
  );
  snout.name = 'dragon-snout';
  snout.position.x = dragon.headLength + dragon.headLength * 0.25;
  snout.position.y = -size * 0.15;
  head.add(snout);

  const hornMaterial = new MeshStandardMaterial({ color: HORN_COLOR, roughness: 0.4 });
  for (const side of [-1, 1]) {
    const horn = new Mesh(new ConeGeometry(BODY_RADIUS * 0.45, BODY_RADIUS * 3, 8), hornMaterial);
    horn.name = 'dragon-horn';
    // Cone points up by default; lean it back and outward.
    horn.position.set(dragon.headLength * 0.3, size * 0.5 + BODY_RADIUS * 1.2, side * size * 0.45);
    horn.rotation.z = Math.PI / 5;
    horn.rotation.x = -side * (Math.PI / 8);
    head.add(horn);
  }

  head.position.copy(spine.getPoint(1));
  head.quaternion.setFromUnitVectors(new Vector3(1, 0, 0), spine.getTangent(1));
  return head;
}

/** Tail at the start of the spine: a long cone tapering to a point, pointing away from the body. */
function buildTail(spine: CatmullRomCurve3): Mesh {
  const tail = new Mesh(
    new ConeGeometry(BODY_RADIUS, dragon.tailLength, 12),
    new MeshStandardMaterial({ color: TAIL_COLOR, roughness: 0.6 }),
  );
  tail.name = 'dragon-tail';
  const away = spine.getTangent(0).negate();
  tail.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), away);
  tail.position.copy(spine.getPoint(0)).addScaledVector(away, dragon.tailLength / 2);
  return tail;
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

  const spine = dragonSpine(spec);
  group.add(buildHead(spine));
  group.add(buildTail(spine));
  return group;
}
