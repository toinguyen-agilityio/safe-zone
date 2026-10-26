import { CylinderGeometry, DoubleSide, Mesh, MeshBasicMaterial } from 'three';
import type { ZoneCircle } from '../systems/zone-system';

/** How tall the wall of water stands. */
export const WALL_HEIGHT = 40;
const SEGMENTS = 96;

/** Where the wall stands and how wide it is for a zone circle. */
export function wallPlacement(zone: ZoneCircle): { x: number; z: number; radius: number } {
  return { x: zone.center.x, z: zone.center.z, radius: zone.radius };
}

export interface WaterWall {
  mesh: Mesh;
  /** Follow the zone: call every frame with the current circle. */
  update: (zone: ZoneCircle) => void;
}

/**
 * A translucent open cylinder of water that marks the edge of the dry zone. It is built once with
 * radius 1 and scaled to the zone, so following the shrink costs nothing.
 */
export function createWaterWall(): WaterWall {
  const geometry = new CylinderGeometry(1, 1, WALL_HEIGHT, SEGMENTS, 1, true);
  const material = new MeshBasicMaterial({
    color: 0x3b8ea5,
    transparent: true,
    opacity: 0.35,
    side: DoubleSide,
    depthWrite: false,
  });
  const mesh = new Mesh(geometry, material);
  mesh.name = 'water-wall';
  mesh.frustumCulled = false;
  mesh.position.y = WALL_HEIGHT / 2;

  return {
    mesh,
    update(zone) {
      const { x, z, radius } = wallPlacement(zone);
      mesh.position.x = x;
      mesh.position.z = z;
      // Only across the ground: the wall keeps its height however the zone shrinks.
      mesh.scale.set(radius, 1, radius);
    },
  };
}
