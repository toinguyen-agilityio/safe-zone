import {
  BoxGeometry,
  ConeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
} from 'three';
import type { LandmarkBuilder } from './index';

const PINK = 0xe9a3b8;
const TRIM = 0xf6e3e8;
const ROOF = 0x8a4a5a;
const ROOSTER = 0xd8892b;
const COMB = 0xc2332b;

function part(
  name: string,
  geometry: BufferGeometry,
  color: number,
  x: number,
  y: number,
  z: number,
): Mesh {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.75 }));
  mesh.name = name;
  mesh.position.set(x, y, z);
  return mesh;
}

/** A small rooster standing on the spire, facing +z. */
function buildRooster(): Group {
  const rooster = new Group();
  rooster.name = 'rooster';
  rooster.add(
    part('rooster-body', new SphereGeometry(0.9, 12, 8).scale(1.3, 1, 0.9), ROOSTER, 0, 0, 0),
  );
  rooster.add(part('rooster-head', new SphereGeometry(0.5, 10, 8), ROOSTER, 0, 0.9, 0.8));
  rooster.add(
    part(
      'rooster-beak',
      new ConeGeometry(0.2, 0.5, 6).rotateX(Math.PI / 2),
      0xf2c14e,
      0,
      0.85,
      1.4,
    ),
  );
  rooster.add(part('rooster-comb', new BoxGeometry(0.15, 0.4, 0.5), COMB, 0, 1.4, 0.8));
  rooster.add(
    part(
      'rooster-tail',
      new ConeGeometry(0.5, 1.8, 6).rotateX(-Math.PI / 2.4),
      ROOSTER,
      0,
      0.6,
      -1.4,
    ),
  );
  return rooster;
}

/** The pink Cock Church: a long nave, a front bell tower with a spire and a rooster on top. */
const cockChurch: LandmarkBuilder = {
  id: 'cockChurch',
  build(spec) {
    const group = new Group();
    const { width, depth } = spec.footprint;
    const naveWidth = width * 0.6;
    const naveDepth = depth * 0.72;
    const naveHeight = spec.height * 0.34;
    const naveZ = -depth / 2 + naveDepth / 2 + 1;

    group.add(
      part(
        'nave',
        new BoxGeometry(naveWidth, naveHeight, naveDepth),
        PINK,
        0,
        naveHeight / 2,
        naveZ,
      ),
    );
    const roofHeight = naveHeight * 0.4;
    group.add(
      part(
        'nave-roof',
        new ConeGeometry(naveDepth * 0.5, roofHeight, 4)
          .scale(naveWidth / naveDepth, 1, 1)
          .rotateY(Math.PI / 4),
        ROOF,
        0,
        naveHeight + roofHeight / 2,
        naveZ,
      ),
    );

    const towerSize = width * 0.24;
    const towerHeight = spec.height * 0.62;
    const towerZ = depth / 2 - towerSize / 2 - 1;
    group.add(
      part(
        'tower',
        new BoxGeometry(towerSize, towerHeight, towerSize),
        PINK,
        0,
        towerHeight / 2,
        towerZ,
      ),
    );
    group.add(
      part(
        'tower-band',
        new BoxGeometry(towerSize * 1.1, 1, towerSize * 1.1),
        TRIM,
        0,
        towerHeight * 0.6,
        towerZ,
      ),
    );

    const spireHeight = spec.height * 0.3;
    group.add(
      part(
        'spire',
        new ConeGeometry(towerSize * 0.75, spireHeight, 4).rotateY(Math.PI / 4),
        ROOF,
        0,
        towerHeight + spireHeight / 2,
        towerZ,
      ),
    );

    for (const side of [-1, 1]) {
      const turretHeight = spec.height * 0.42;
      const turretSize = towerSize * 0.45;
      group.add(
        part(
          'turret',
          new BoxGeometry(turretSize, turretHeight, turretSize),
          PINK,
          side * (towerSize / 2 + turretSize / 2 + 0.5),
          turretHeight / 2,
          towerZ,
        ),
      );
    }

    const rooster = buildRooster();
    rooster.position.set(0, towerHeight + spireHeight + 0.9, towerZ);
    group.add(rooster);
    return group;
  },
};

export default cockChurch;
