import { BoxGeometry, Color, InstancedMesh, Matrix4 } from 'three';
import { createHouseMaterial } from './house-material';
import type { House } from '../world/houses';

const WALL_COLORS = [0xe8d9b5, 0xd9c7a0, 0xf0e4c8, 0xc9b896, 0xe3cfa8, 0xd4a98a, 0xbfae8c];

/** Every house is one instance of a unit box, scaled to its size: a single draw call. */
export function buildHouses(houses: House[]): InstancedMesh {
  // Base of the box sits on the ground so instances only need scale and position.
  const geometry = new BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const mesh = new InstancedMesh(geometry, createHouseMaterial(), houses.length);
  mesh.name = 'houses';

  const matrix = new Matrix4();
  const color = new Color();
  houses.forEach((house, i) => {
    matrix.makeScale(house.width, house.height, house.depth).setPosition(house.cx, 0, house.cz);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, color.setHex(WALL_COLORS[i % WALL_COLORS.length]!));
  });
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return mesh;
}
