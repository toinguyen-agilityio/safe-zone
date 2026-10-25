import { PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { config } from './config';
import { EventBus } from './core/events';
import { GameLoop } from './core/loop';
import { Pause, runUpdates } from './core/pause';
import { Input } from './core/input';
import { createParachutingPlayer } from './entities/player';
import { applyPlayerToCamera } from './render/first-person-camera';
import { buildCanopy, updateCanopy } from './render/parachute';
import { createFpsMeter } from './ui/fps-meter';
import { mountUi } from './ui/mount';
import { createRenderer } from './render/renderer';
import { buildWorldScene } from './render/world-scene';
import { readMoveKeys } from './systems/movement';
import { createMotionWorld, updatePlayerMotion } from './systems/player-motion';
import { getLayout } from './world/layout';

declare module './core/events' {
  interface EventMap {
    /** The mouse was captured (true) or released (false), for example by Esc. */
    pointerlock: { locked: boolean };
  }
}

export type UpdateFn = (dt: number) => void;

/** Owns the renderer, scene, camera and loop. Features register update functions. */
export class Game {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(60, 1, 0.1, 1000);
  readonly renderer: WebGLRenderer;
  private readonly updates: UpdateFn[] = [];
  readonly events = new EventBus();
  readonly pause = new Pause();
  readonly input: Input;
  readonly player = createParachutingPlayer(config.world.defaultSeed);
  private readonly loop: GameLoop;

  constructor(private readonly container: HTMLElement) {
    this.renderer = createRenderer(container);
    this.loop = new GameLoop({
      maxDt: config.world.maxDt,
      update: (dt) => runUpdates(this.updates, dt, this.pause),
      render: () => this.renderer.render(this.scene, this.camera),
    });
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => this.loop.resetClock());
    this.scene.add(buildWorldScene(getLayout()));
    this.input = new Input(document, this.renderer.domElement);
    // The overhead camera stays in render/overhead-camera.ts for the menu; play uses the eyes.
    const motionWorld = createMotionWorld(getLayout());
    const canopy = buildCanopy();
    this.scene.add(canopy);
    this.addUpdate((dt) => {
      updatePlayerMotion(
        this.player,
        {
          keys: readMoveKeys(this.input),
          mouseDelta: this.input.consumeMouseDelta(),
          locked: this.input.pointerLocked,
          jump: this.input.isDown('Space'),
        },
        motionWorld,
        dt,
      );
      updateCanopy(canopy, this.player);
      applyPlayerToCamera(this.camera, this.player);
    });
    applyPlayerToCamera(this.camera, this.player);
    document.addEventListener('pointerlockchange', () =>
      this.events.emit('pointerlock', { locked: this.input.pointerLocked }),
    );
    mountUi(container, {
      events: this.events,
      player: this.player,
      pause: this.pause,
      requestPointerLock: () => this.renderer.domElement.requestPointerLock(),
    });
    const fps = createFpsMeter(window.location.search, container);
    if (fps) this.addUpdate((dt) => fps.update(dt));
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
