import { WebGLRenderer } from 'three';
import { config } from '../config';

/** The pixel ratio to draw at: the display's own, but never above the cap. */
export function pixelRatioFor(devicePixelRatio: number): number {
  const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(ratio, config.world.maxPixelRatio);
}

export function createRenderer(
  container: HTMLElement,
  display: { devicePixelRatio: number } = window,
): WebGLRenderer {
  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(pixelRatioFor(display.devicePixelRatio));
  container.appendChild(renderer.domElement);
  return renderer;
}
