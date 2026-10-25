import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import type { BridgeSpec } from '../world/bridges';

const CONCRETE_COLOR = 0xb9b6ae;
const DECK_THICKNESS = 0.6;

function slab(name: string, length: number, width: number, material: MeshStandardMaterial): Mesh {
  const mesh = new Mesh(new BoxGeometry(length, DECK_THICKNESS, width), material);
  mesh.name = name;
  return mesh;
}

/** A sloped slab whose top surface runs from (x0, 0) up to (x1, rise), or down when x1 < x0. */
function ramp(
  spec: BridgeSpec,
  groundX: number,
  deckX: number,
  material: MeshStandardMaterial,
): Mesh {
  const run = Math.abs(deckX - groundX);
  const rise = spec.deckHeight;
  const angle = Math.atan2(rise, run);
  const direction = deckX > groundX ? 1 : -1;
  const mesh = slab('ramp', Math.hypot(run, rise), spec.deckWidth, material);

  const topCenterX = (groundX + deckX) / 2;
  const topCenterY = rise / 2;
  // The slab hangs below its top surface, along the surface normal.
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  mesh.rotation.z = direction * angle;
  mesh.position.set(
    topCenterX + direction * sin * (DECK_THICKNESS / 2),
    topCenterY - cos * (DECK_THICKNESS / 2),
    spec.z,
  );
  return mesh;
}

/** One group per bridge: a flat deck over the river and a ramp at each end. */
export function buildBridges(specs: BridgeSpec[]): Group {
  const root = new Group();
  root.name = 'bridges';
  const material = new MeshStandardMaterial({ color: CONCRETE_COLOR });

  for (const spec of specs) {
    const group = new Group();
    group.name = `bridge-${spec.id}`;

    const deck = slab('deck', spec.deckEndX - spec.deckStartX, spec.deckWidth, material);
    deck.position.set(
      (spec.deckStartX + spec.deckEndX) / 2,
      spec.deckHeight - DECK_THICKNESS / 2,
      spec.z,
    );
    group.add(deck);

    group.add(ramp(spec, spec.rampStartX, spec.deckStartX, material));
    group.add(ramp(spec, spec.rampEndX, spec.deckEndX, material));
    root.add(group);
  }
  return root;
}
