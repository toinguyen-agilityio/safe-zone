import { PerspectiveCamera, Scene, type WebGLRenderer } from 'three';
import { config } from './config';
import { EventBus } from './core/events';
import { GameLoop } from './core/loop';
import { Pause, runUpdates } from './core/pause';
import { Input } from './core/input';
import { createParachutingPlayer } from './entities/player';
import { installAudio } from './audio/audio-context';
import { connectSounds } from './audio/sound-system';
import { Health } from './entities/health';
import { Inventory } from './entities/inventory';
import { Weapon } from './entities/weapon';
import {
  applyAimToCamera,
  applyPlayerToCamera,
  HIP_FOV_DEGREES,
} from './render/first-person-camera';
import { MuzzleFlash } from './render/muzzle-flash';
import { TracerPool } from './render/tracer';
import { buildCanopy, updateCanopy } from './render/parachute';
import { createFpsMeter } from './ui/fps-meter';
import { mountUi } from './ui/mount';
import { createRenderer } from './render/renderer';
import { attachViewmodel, placeViewmodel } from './render/viewmodel';
import { buildWorldScene } from './render/world-scene';
import { readMoveKeys } from './systems/movement';
import { createRng } from './core/rng';
import { Aim } from './systems/aim';
import { AiSystem } from './systems/ai-system';
import { PickupSystem } from './systems/pickup-system';
import { connectDamage } from './systems/damage-system';
import { KillLog } from './systems/kill-log';
import { FireControl } from './systems/fire-control';
import { Recoil } from './systems/recoil';
import { BotSystem } from './systems/bot-system';
import { connectShotResolution, createShotObstacles } from './systems/shot';
import { createMotionWorld, updatePlayerMotion } from './systems/player-motion';
import { getLayout } from './world/layout';
import { generateLoot } from './world/loot-spawn';

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
  readonly camera = new PerspectiveCamera(HIP_FOV_DEGREES, 1, 0.1, 1000);
  readonly renderer: WebGLRenderer;
  private readonly updates: UpdateFn[] = [];
  readonly events = new EventBus();
  readonly pause = new Pause();
  readonly input: Input;
  readonly weapon = new Weapon();
  /** Right mouse button: raises the rifle to the eye and narrows the view. */
  readonly aim = new Aim();
  readonly player = createParachutingPlayer(config.world.defaultSeed);
  readonly playerHealth = new Health();
  readonly kills: KillLog;
  /** The 19 opponents; they drop in together with the player. */
  readonly bots: BotSystem;
  /** Runs the bot brains: they hunt the nearest enemy in sight. */
  readonly ai: AiSystem;
  readonly inventory = new Inventory(this.playerHealth);
  /** The items still lying on the sidewalks. */
  readonly pickups: PickupSystem;
  /** Seconds of play so far, written on each kill. */
  private elapsed = 0;
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
    // The camera joins the scene so the rifle parented to it gets drawn.
    this.scene.add(this.camera);
    const rifle = attachViewmodel(this.camera);
    const tracers = new TracerPool(this.scene);
    const flash = new MuzzleFlash(rifle);
    this.events.on('shot', (shot) => {
      tracers.fire(shot.origin, shot.direction);
      flash.flash();
    });
    this.input = new Input(document, this.renderer.domElement);
    this.kills = new KillLog(this.events);
    this.pickups = new PickupSystem(generateLoot(getLayout()), this.events);
    // Browsers only allow sound after a click, so the audio context waits for the first one.
    installAudio(document);
    connectSounds(this.events);
    // The overhead camera stays in render/overhead-camera.ts for the menu; play uses the eyes.
    const motionWorld = createMotionWorld(getLayout());
    this.bots = BotSystem.create(config.world.defaultSeed, this.scene, motionWorld);
    const shotObstacles = createShotObstacles(getLayout());
    this.ai = new AiSystem(
      this.bots,
      motionWorld,
      shotObstacles,
      () => ({
        id: 'player',
        x: this.player.x,
        z: this.player.z,
        feetY: this.player.y - config.player.eyeHeight,
        dead: this.player.dead,
        parachuting: this.player.parachuting,
      }),
      config.world.defaultSeed,
    );
    connectShotResolution(this.events, {
      obstacles: shotObstacles,
      targets: () => this.bots.alive,
    });
    connectDamage(this.events, {
      entity: (id) =>
        id === 'player'
          ? { id, health: this.playerHealth, onKilled: () => (this.player.dead = true) }
          : this.bots.damageable(id),
      kills: this.kills,
      now: () => this.elapsed,
    });
    const fireControl = new FireControl(this.weapon, this.player, this.input, this.events, {
      shooterId: 'player',
      rng: createRng(config.world.defaultSeed ^ 0x5407),
      recoil: new Recoil(),
      spreadState: () => {
        const keys = readMoveKeys(this.input);
        const walking = keys.forward || keys.back || keys.left || keys.right;
        return {
          moving: walking && !this.player.airborne,
          airborne: this.player.airborne,
          aiming: this.aim.aiming,
        };
      },
    });
    const canopy = buildCanopy();
    this.scene.add(canopy);
    this.addUpdate((dt) => {
      this.elapsed += dt;
      this.bots.update(dt);
      this.ai.update(dt);
      tracers.update(dt);
      flash.update(dt);
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
      this.aim.update(dt, {
        wantsAim: this.input.pointerLocked && !this.player.dead && this.input.isMouseDown(2),
        swimming: this.player.swimming,
        parachuting: this.player.parachuting,
        sprinting: this.player.sprinting,
      });
      if (!this.player.dead && !this.player.parachuting) {
        this.pickups.update(this.player, this.inventory);
      }
      fireControl.update(dt, this.input.pointerLocked);
      placeViewmodel(rifle, this.aim.amount);
      applyAimToCamera(this.camera, this.aim.amount);
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
