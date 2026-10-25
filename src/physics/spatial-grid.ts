import { config } from '../config';

/** An axis-aligned box on the ground plane. */
export interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

/** Straight-line distance from a point to a box; 0 when the point is inside it. */
export function distanceToBox(x: number, z: number, box: Box): number {
  const dx = Math.max(box.minX - x, 0, x - box.maxX);
  const dz = Math.max(box.minZ - z, 0, z - box.maxZ);
  return Math.hypot(dx, dz);
}

/**
 * A uniform grid of boxes. A query only looks at the cells it touches, so finding what is near
 * a position stays fast however many boxes the city has.
 */
export class SpatialGrid<T extends Box = Box> {
  private readonly cells = new Map<string, T[]>();

  constructor(private readonly cellSize: number = config.world.gridCellSize) {}

  private cellRange(min: number, max: number): [number, number] {
    return [Math.floor(min / this.cellSize), Math.floor(max / this.cellSize)];
  }

  /** Add a box to every cell it touches. */
  insert(box: T): void {
    const [x0, x1] = this.cellRange(box.minX, box.maxX);
    const [z0, z1] = this.cellRange(box.minZ, box.maxZ);
    for (let cx = x0; cx <= x1; cx++) {
      for (let cz = z0; cz <= z1; cz++) {
        const key = `${cx},${cz}`;
        const cell = this.cells.get(key);
        if (cell) cell.push(box);
        else this.cells.set(key, [box]);
      }
    }
  }

  /** Boxes that overlap the given area, each returned once. */
  queryBox(area: Box): T[] {
    const [x0, x1] = this.cellRange(area.minX, area.maxX);
    const [z0, z1] = this.cellRange(area.minZ, area.maxZ);
    const found = new Set<T>();
    for (let cx = x0; cx <= x1; cx++) {
      for (let cz = z0; cz <= z1; cz++) {
        for (const box of this.cells.get(`${cx},${cz}`) ?? []) {
          if (
            box.minX <= area.maxX &&
            box.maxX >= area.minX &&
            box.minZ <= area.maxZ &&
            box.maxZ >= area.minZ
          ) {
            found.add(box);
          }
        }
      }
    }
    return [...found];
  }

  /** Boxes within `radius` of the point, each returned once. */
  queryNear(x: number, z: number, radius: number): T[] {
    const candidates = this.queryBox({
      minX: x - radius,
      maxX: x + radius,
      minZ: z - radius,
      maxZ: z + radius,
    });
    return candidates.filter((box) => distanceToBox(x, z, box) <= radius);
  }
}
