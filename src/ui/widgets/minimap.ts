import { config } from '../../config';
import { riverCenterX, getLayout } from '../../world/layout';
import type { Layout } from '../../world/types';
import type { UiContext } from '../mount';
import './minimap.css';

/** The parts of a canvas 2D context the minimap uses, so a test can pass a recorder. */
export type MapContext = Pick<
  CanvasRenderingContext2D,
  | 'save'
  | 'restore'
  | 'translate'
  | 'rotate'
  | 'fillRect'
  | 'beginPath'
  | 'moveTo'
  | 'lineTo'
  | 'closePath'
  | 'arc'
  | 'clip'
  | 'fill'
  | 'stroke'
  | 'fillStyle'
  | 'strokeStyle'
  | 'lineWidth'
  | 'lineJoin'
>;

/** Where the player stands and which way they look. */
export interface MapView {
  x: number;
  z: number;
  yaw: number;
}

const COLORS = {
  ground: '#3c4a3a',
  street: '#9aa0a6',
  river: '#3f8fb5',
  marker: '#ffd400',
};

/** Step along the river when drawing its curve, in world units. */
const RIVER_STEP = 10;

/**
 * Draw the map into a round window of `size` pixels. The player is in the middle and the map is
 * turned by the yaw, so the way the player looks is up. `scale` is pixels per world unit.
 */
export function drawMinimap(
  g: MapContext,
  layout: Layout,
  view: MapView,
  size: number,
  scale: number,
): void {
  const middle = size / 2;
  g.save();
  g.beginPath();
  g.arc(middle, middle, middle, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = COLORS.ground;
  g.fillRect(0, 0, size, size);

  // World to minimap: put the player in the middle, turn with the view, then scale.
  g.translate(middle, middle);
  g.rotate(view.yaw);
  g.translate(-view.x * scale, -view.z * scale);

  g.fillStyle = COLORS.street;
  for (const street of layout.streets) {
    g.fillRect(
      (street.cx - street.width / 2) * scale,
      (street.cz - street.depth / 2) * scale,
      street.width * scale,
      street.depth * scale,
    );
  }

  g.strokeStyle = COLORS.river;
  g.lineWidth = layout.river.width * scale;
  g.lineJoin = 'round';
  g.beginPath();
  const half = config.world.mapSize / 2;
  for (let z = -half; z <= half; z += RIVER_STEP) {
    const x = riverCenterX(z) * scale;
    if (z === -half) g.moveTo(x, z * scale);
    else g.lineTo(x, z * scale);
  }
  g.stroke();
  g.restore();

  // The player's marker stays in the middle, pointing up.
  g.save();
  g.translate(middle, middle);
  g.fillStyle = COLORS.marker;
  g.beginPath();
  g.moveTo(0, -8);
  g.lineTo(6, 7);
  g.lineTo(0, 4);
  g.lineTo(-6, 7);
  g.closePath();
  g.fill();
  g.restore();
}

export function mount(ctx: UiContext): () => void {
  const { size, scale } = config.ui.minimap;
  const canvas = document.createElement('canvas');
  canvas.className = 'minimap';
  canvas.width = size;
  canvas.height = size;
  ctx.root.appendChild(canvas);

  const g = canvas.getContext('2d');
  const layout = getLayout();
  let frame = 0;
  const refresh = () => {
    if (g) {
      g.clearRect(0, 0, size, size);
      drawMinimap(g, layout, ctx.player, size, scale);
    }
    frame = requestAnimationFrame(refresh);
  };
  frame = requestAnimationFrame(refresh);

  return () => {
    cancelAnimationFrame(frame);
    canvas.remove();
  };
}
