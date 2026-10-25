import {
  BoxGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from 'three';
import { createSign } from '../sign';
import type { LandmarkBuilder } from './index';

const BRICK = 0xb4552f;
const BRICK_DARK = 0x8d3f22;
const STONE = 0xd9cdb4;
const TIERS = 4;

function part(
  name: string,
  geometry: BufferGeometry,
  color: number,
  y: number,
  x = 0,
  z = 0,
): Mesh {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.9 }));
  mesh.name = name;
  mesh.position.set(x, y, z);
  return mesh;
}

/** A Cham tower (kalan): square tiers that shrink as they rise, ending in a small pointed top. */
function buildTower(baseSize: number, height: number, x: number, z: number): Group {
  const tower = new Group();
  tower.name = 'cham-tower';
  const tierHeight = (height * 0.85) / TIERS;
  let y = 0;
  for (let i = 0; i < TIERS; i++) {
    const size = baseSize * (1 - i * 0.18);
    const color = i % 2 === 0 ? BRICK : BRICK_DARK;
    tower.add(
      part('tower-tier', new BoxGeometry(size, tierHeight, size), color, y + tierHeight / 2),
    );
    y += tierHeight;
  }
  const topSize = baseSize * (1 - TIERS * 0.18) + baseSize * 0.2;
  tower.add(
    part(
      'tower-top',
      new ConeGeometry(topSize, height * 0.15 + baseSize * 0.2, 4).rotateY(Math.PI / 4),
      BRICK,
      y + (height * 0.15 + baseSize * 0.2) / 2,
    ),
  );
  tower.position.set(x, 0, z);
  return tower;
}

/** A low stone museum hall with Cham towers behind it and a Vietnamese sign on the front. */
const chamMuseum: LandmarkBuilder = {
  id: 'chamMuseum',
  build(spec) {
    const group = new Group();
    const { width, depth } = spec.footprint;
    const hallDepth = depth * 0.35;
    const hallHeight = spec.height * 0.4;
    const hallZ = depth / 2 - hallDepth / 2 - 1;

    group.add(
      part(
        'hall',
        new BoxGeometry(width * 0.85, hallHeight, hallDepth),
        STONE,
        hallHeight / 2,
        0,
        hallZ,
      ),
    );
    group.add(
      part(
        'hall-roof',
        new BoxGeometry(width * 0.9, 0.8, hallDepth + 1.5),
        BRICK_DARK,
        hallHeight + 0.4,
        0,
        hallZ,
      ),
    );

    const towerZ = -depth * 0.12;
    group.add(buildTower(width * 0.2, spec.height * 0.95, 0, towerZ));
    group.add(buildTower(width * 0.13, spec.height * 0.7, -width * 0.28, towerZ));
    group.add(buildTower(width * 0.13, spec.height * 0.7, width * 0.28, towerZ));

    const sign = createSign({
      text: 'BẢO TÀNG CHĂM',
      width: width * 0.5,
      height: width * 0.07,
      background: '#5a3a22',
      foreground: '#f5e6c8',
    });
    sign.position.set(0, hallHeight - 1.2, hallZ + hallDepth / 2 + 0.2);
    group.add(sign);
    return group;
  },
};

export default chamMuseum;
