import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import type { PerspectiveCamera } from 'three';

/** Where the rifle sits in the camera's space: lower right, a little ahead of the lens. */
const OFFSET = { x: 0.2, y: -0.2, z: -0.8 };
/** Aimed: the rifle sits in the middle of the view, a little lower so the sights show. */
const AIMED_OFFSET = { x: 0, y: -0.12, z: -0.7 };
const BODY_COLOR = 0x2b2f33;
const WOOD_COLOR = 0x6b4a2b;
const METAL_COLOR = 0x15171a;

function part(
  geometry: BoxGeometry | CylinderGeometry,
  color: number,
  x: number,
  y: number,
  z: number,
): Mesh {
  // Basic material: the rifle looks the same in sun, shade and indoors.
  const mesh = new Mesh(geometry, new MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
}

/** A blocky rifle pointing down -z, built from a few boxes and a barrel. */
export function buildRifle(): Group {
  const rifle = new Group();
  rifle.name = 'rifle';

  rifle.add(part(new BoxGeometry(0.06, 0.09, 0.42), BODY_COLOR, 0, 0, 0));
  rifle.add(part(new BoxGeometry(0.055, 0.1, 0.22), WOOD_COLOR, 0, -0.01, 0.3));
  rifle.add(part(new BoxGeometry(0.05, 0.14, 0.07), METAL_COLOR, 0, -0.1, 0.02));
  rifle.add(part(new BoxGeometry(0.05, 0.08, 0.05), BODY_COLOR, 0, -0.08, 0.14));

  const barrel = part(new CylinderGeometry(0.014, 0.014, 0.4, 8), METAL_COLOR, 0, 0.01, -0.4);
  barrel.rotation.x = Math.PI / 2;
  rifle.add(barrel);
  rifle.add(part(new BoxGeometry(0.012, 0.03, 0.012), METAL_COLOR, 0, 0.06, -0.58));
  return rifle;
}

/** Attach the rifle to the camera so it follows the view. Needs the camera to be in the scene. */
export function attachViewmodel(camera: PerspectiveCamera): Group {
  const rifle = buildRifle();
  placeViewmodel(rifle, 0);
  camera.add(rifle);
  return rifle;
}

/** Slide the rifle from the lower right (0) to the centre of the view (1). */
export function placeViewmodel(rifle: Group, aim: number): void {
  rifle.position.set(
    OFFSET.x + (AIMED_OFFSET.x - OFFSET.x) * aim,
    OFFSET.y + (AIMED_OFFSET.y - OFFSET.y) * aim,
    OFFSET.z + (AIMED_OFFSET.z - OFFSET.z) * aim,
  );
}
