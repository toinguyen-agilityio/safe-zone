import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
} from 'three';
import { config } from '../config';
import { riverCenterX } from '../world/layout';
import type { Layout } from '../world/types';

const { world } = config;

const BED_COLOR = 0x6b5a3c;
const BANK_COLOR = 0x5a4a30;
const WATER_COLOR = 0x2f7fb8;

export interface Bank {
  /** x of the bank edge at each sample z. */
  xs: number[];
  zs: number[];
}

/** Both river banks sampled along z, running past the map edge plus padding. */
export function riverBanks(layout: Layout): { west: Bank; east: Bank } {
  const limit = layout.size / 2 + world.edgePadding;
  const step = world.river.sampleStep / 2;
  const zs: number[] = [];
  for (let z = -limit; z < limit; z += step) zs.push(z);
  zs.push(limit);
  const half = layout.river.width / 2;
  return {
    west: { zs, xs: zs.map((z) => riverCenterX(z) - half) },
    east: { zs, xs: zs.map((z) => riverCenterX(z) + half) },
  };
}

/** A ribbon between two polylines of equal length. Each point is [x, y, z]. */
function ribbon(a: [number, number, number][], b: [number, number, number][]): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i < a.length; i++) positions.push(...a[i]!, ...b[i]!);
  for (let i = 0; i < a.length - 1; i++) {
    const p = i * 2;
    indices.push(p, p + 1, p + 2, p + 1, p + 3, p + 2);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function line(bank: Bank, y: number): [number, number, number][] {
  return bank.xs.map((x, i) => [x, y, bank.zs[i]!]);
}

function ribbonMesh(
  name: string,
  a: [number, number, number][],
  b: [number, number, number][],
  material: MeshStandardMaterial,
): Mesh {
  const mesh = new Mesh(ribbon(a, b), material);
  mesh.name = name;
  return mesh;
}

export function buildRiver(layout: Layout): Group {
  const { west, east } = riverBanks(layout);
  const { bedDepth, waterLevel } = world.river;
  const group = new Group();
  group.name = 'river';

  const bank = new MeshStandardMaterial({ color: BANK_COLOR, side: DoubleSide });
  group.add(ribbonMesh('bank', line(west, 0), line(west, -bedDepth), bank));
  group.add(ribbonMesh('bank', line(east, 0), line(east, -bedDepth), bank));
  group.add(
    ribbonMesh(
      'river-bed',
      line(west, -bedDepth),
      line(east, -bedDepth),
      new MeshStandardMaterial({ color: BED_COLOR, side: DoubleSide }),
    ),
  );
  group.add(
    ribbonMesh(
      'water',
      line(west, waterLevel),
      line(east, waterLevel),
      new MeshStandardMaterial({
        color: WATER_COLOR,
        transparent: true,
        opacity: 0.85,
        side: DoubleSide,
      }),
    ),
  );
  return group;
}
