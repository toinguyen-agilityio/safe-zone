import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import type { BridgeSpec, Railing } from '../world/bridges';

const RAILING_THICKNESS = 0.15;
const RAILING_COLOR = 0x8c8a84;
const PILLAR_COLOR = 0x9d9a92;

/** A railing piece whose bottom edge runs from (x0, y0) to (x1, y1) at depth z. */
function railingSegment(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z: number,
  height: number,
  material: MeshStandardMaterial,
): Mesh {
  const angle = Math.atan2(y1 - y0, x1 - x0);
  const mesh = new Mesh(
    new BoxGeometry(Math.hypot(x1 - x0, y1 - y0), height, RAILING_THICKNESS),
    material,
  );
  mesh.name = 'railing-segment';
  // Lift the piece half its height along the surface normal so it stands on the deck.
  mesh.position.set(
    (x0 + x1) / 2 - Math.sin(angle) * (height / 2),
    (y0 + y1) / 2 + Math.cos(angle) * (height / 2),
    z,
  );
  mesh.rotation.z = angle;
  return mesh;
}

/** One railing follows the whole bridge: up the west ramp, along the deck, down the east ramp. */
function buildRailing(spec: BridgeSpec, railing: Railing, material: MeshStandardMaterial): Group {
  const group = new Group();
  group.name = 'railing';
  const { rampStartX, deckStartX, deckEndX, rampEndX, deckHeight } = spec;
  const { z, height } = railing;
  group.add(railingSegment(rampStartX, 0, deckStartX, deckHeight, z, height, material));
  group.add(railingSegment(deckStartX, deckHeight, deckEndX, deckHeight, z, height, material));
  group.add(railingSegment(deckEndX, deckHeight, rampEndX, 0, z, height, material));
  return group;
}

/**
 * Railings along both deck sides and pillars standing in the water. Nothing else hangs
 * under the deck, so the river stays open for swimming.
 */
export function buildBridgeDetails(spec: BridgeSpec): Group {
  const group = new Group();
  group.name = 'bridge-details';

  const railingMaterial = new MeshStandardMaterial({ color: RAILING_COLOR });
  for (const railing of spec.railings) group.add(buildRailing(spec, railing, railingMaterial));

  const pillarMaterial = new MeshStandardMaterial({ color: PILLAR_COLOR });
  for (const pillar of spec.pillars) {
    const height = pillar.topY - pillar.bottomY;
    const mesh = new Mesh(
      new CylinderGeometry(pillar.radius, pillar.radius, height, 16),
      pillarMaterial,
    );
    mesh.name = 'pillar';
    mesh.position.set(pillar.x, pillar.bottomY + height / 2, pillar.z);
    group.add(mesh);
  }
  return group;
}
