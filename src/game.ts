import { PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { config } from './config';
import { GameLoop } from './core/loop';
import { createRenderer } from './render/renderer';

export type UpdateFn = (dt: number) => void;

/** Owns the renderer, scene, camera and loop. Features register update functions. */
export class Game {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(60, 1, 0.1, 1000);
  readonly renderer: WebGLRenderer;
  private readonly updates: UpdateFn[] = [];
  private readonly loop: GameLoop;

  constructor(private readonly container: HTMLElement) {
    this.renderer = createRenderer(container);
    this.loop = new GameLoop({
      maxDt: config.world.maxDt,
      update: (dt) => {
        for (const update of this.updates) update(dt);
      },
      render: () => this.renderer.render(this.scene, this.camera),
    });
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => this.loop.resetClock());
    this.resize();
  }

  addUpdate(update: UpdateFn): void {
    this.updates.push(update);
  }

  start(): void {
    this.renderer.setAnimationLoop((timeMs: number) => this.loop.tick(timeMs));
  }

  private resize(): void {
    const { clientWidth: w, clientHeight: h } = this.container;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
