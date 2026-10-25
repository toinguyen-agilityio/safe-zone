import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { createSign } from '../sign';
import type { LandmarkBuilder } from './index';

const WALL = 0xefe3c2;
const ROOF = 0xa6402a;
const PILLAR = 0xf7f3e6;
const SIGN_BACKGROUND = '#b3261e';
const SIGN_TEXT = '#ffe9a8';

function mesh(
  name: string,
  geometry: BoxGeometry | ConeGeometry | CylinderGeometry,
  color: number,
) {
  const m = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.8 }));
  m.name = name;
  return m;
}

/** A covered market hall with a pillared front, a square tower and a sign over the entrance. */
const hanMarket: LandmarkBuilder = {
  id: 'hanMarket',
  build(spec) {
    const group = new Group();
    const hall = Math.min(spec.footprint.width, spec.footprint.depth) - 8;
    const wallHeight = spec.height * 0.5;
    const half = hall / 2;

    const walls = mesh('hall', new BoxGeometry(hall, wallHeight, hall), WALL);
    walls.position.y = wallHeight / 2;
    group.add(walls);

    const roofHeight = spec.height * 0.28;
    const roof = mesh(
      'roof',
      new ConeGeometry(hall * 0.76, roofHeight, 4).rotateY(Math.PI / 4),
      ROOF,
    );
    roof.position.y = wallHeight + roofHeight / 2;
    group.add(roof);

    const towerSize = hall * 0.22;
    const tower = mesh('tower', new BoxGeometry(towerSize, spec.height * 0.6, towerSize), WALL);
    tower.position.set(0, spec.height * 0.3 + wallHeight * 0.5, 0);
    group.add(tower);
    const towerTop = mesh(
      'tower-roof',
      new ConeGeometry(towerSize * 0.8, spec.height * 0.22, 4).rotateY(Math.PI / 4),
      ROOF,
    );
    towerTop.position.set(0, wallHeight * 0.5 + spec.height * 0.6 + spec.height * 0.11, 0);
    group.add(towerTop);

    const columns = 6;
    for (let i = 0; i < columns; i++) {
      const x = -half * 0.8 + (i * (half * 1.6)) / (columns - 1);
      const column = mesh('pillar', new CylinderGeometry(0.7, 0.7, wallHeight, 10), PILLAR);
      column.position.set(x, wallHeight / 2, half + 1.5);
      group.add(column);
    }

    const sign = createSign({
      text: 'CHỢ HÀN',
      width: hall * 0.5,
      height: hall * 0.1,
      background: SIGN_BACKGROUND,
      foreground: SIGN_TEXT,
    });
    sign.position.set(0, wallHeight + hall * 0.05 + 0.6, half + 0.2);
    group.add(sign);
    return group;
  },
};

export default hanMarket;
