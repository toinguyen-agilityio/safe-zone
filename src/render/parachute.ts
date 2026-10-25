import {
  DoubleSide,
  Group,
  LineBasicMaterial,
  BufferGeometry,
  Line,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
} from 'three';
import type { Player } from '../entities/player';

const CANOPY_RADIUS = 4.5;
/** How far above the eyes the canopy hangs. */
const CANOPY_HEIGHT = 6.5;
const SEGMENTS = 12;
const COLORS = [0xd93a2b, 0xf4f1e8];

/** A striped half-dome canopy with cords down to where the player hangs. */
export function buildCanopy(): Group {
  const canopy = new Group();
  canopy.name = 'canopy';

  for (let i = 0; i < SEGMENTS; i++) {
    const start = (i / SEGMENTS) * Math.PI * 2;
    const panel = new Mesh(
      new SphereGeometry(CANOPY_RADIUS, 4, 6, start, (Math.PI * 2) / SEGMENTS, 0, Math.PI / 2),
      new MeshStandardMaterial({
        color: COLORS[i % COLORS.length]!,
        side: DoubleSide,
        roughness: 0.8,
      }),
    );
    panel.name = 'canopy-panel';
    panel.scale.y = 0.55;
    canopy.add(panel);
  }

  const cords = new LineBasicMaterial({ color: 0x555555 });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const rim = new Vector3(Math.cos(angle) * CANOPY_RADIUS, 0, Math.sin(angle) * CANOPY_RADIUS);
    const cord = new Line(
      new BufferGeometry().setFromPoints([rim, new Vector3(0, -CANOPY_HEIGHT + 0.5, 0)]),
      cords,
    );
    cord.name = 'canopy-cord';
    canopy.add(cord);
  }

  return canopy;
}

/** Keep the canopy above the player while the drop lasts, and hide it afterwards. */
export function updateCanopy(canopy: Group, player: Player): void {
  canopy.visible = player.parachuting;
  canopy.position.set(player.x, player.y + CANOPY_HEIGHT, player.z);
}
