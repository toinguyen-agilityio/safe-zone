import {
  BoxGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three';
import type { Layout, Street } from '../world/types';

const GRASS_COLOR = 0x4f7f3a;
const ASPHALT_COLOR = 0x3a3d42;
const MARKING_COLOR = 0xf2f2f2;

const DASH_LENGTH = 4;
const DASH_GAP = 6;
const DASH_WIDTH = 0.4;

const STREET_Y = 0.15;
const MARKING_Y = 0.3;

function flatMesh(width: number, depth: number, color: number, y: number): Mesh {
  const mesh = new Mesh(
    new PlaneGeometry(width, depth).rotateX(-Math.PI / 2),
    new MeshStandardMaterial({ color }),
  );
  mesh.position.y = y;
  return mesh;
}

function streetMesh(street: Street): Mesh {
  const mesh = flatMesh(street.width, street.depth, ASPHALT_COLOR, STREET_Y);
  mesh.position.x = street.cx;
  mesh.position.z = street.cz;
  mesh.name = 'street';
  return mesh;
}

function dashMatrices(street: Street): Matrix4[] {
  const along = street.orientation === 'north-south' ? street.depth : street.width;
  const step = DASH_LENGTH + DASH_GAP;
  const count = Math.floor(along / step);
  const start = -along / 2 + DASH_LENGTH / 2 + (along - count * step) / 2;
  const matrices: Matrix4[] = [];
  for (let i = 0; i < count; i++) {
    const offset = start + i * step;
    matrices.push(
      street.orientation === 'north-south'
        ? new Matrix4().makeTranslation(street.cx, MARKING_Y, street.cz + offset)
        : new Matrix4().makeTranslation(street.cx + offset, MARKING_Y, street.cz),
    );
  }
  return matrices;
}

function markingsMesh(streets: Street[], orientation: Street['orientation']): InstancedMesh {
  const matrices = streets.filter((s) => s.orientation === orientation).flatMap(dashMatrices);
  // The box is long along x; north-south dashes swap the two sizes so they run along z.
  const geometry =
    orientation === 'east-west'
      ? new BoxGeometry(DASH_LENGTH, 0.02, DASH_WIDTH)
      : new BoxGeometry(DASH_WIDTH, 0.02, DASH_LENGTH);
  const mesh = new InstancedMesh(
    geometry,
    new MeshStandardMaterial({ color: MARKING_COLOR }),
    matrices.length,
  );
  matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
  mesh.name = 'markings';
  return mesh;
}

export function buildGround(layout: Layout): Group {
  const group = new Group();
  group.name = 'ground';

  const grass = flatMesh(layout.size, layout.size, GRASS_COLOR, 0);
  grass.name = 'grass';
  group.add(grass);

  for (const street of layout.streets) group.add(streetMesh(street));
  group.add(markingsMesh(layout.streets, 'north-south'));
  group.add(markingsMesh(layout.streets, 'east-west'));
  return group;
}
