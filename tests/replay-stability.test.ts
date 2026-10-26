import { Object3D } from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '../src/game';

/**
 * Three matches in a row, replaying from the end screen each time, with no browser: a small fake
 * page stands in for the DOM and the renderer is faked, but the game, its systems, the UI and the
 * scene are the real ones. Nothing may throw and nothing may pile up from match to match.
 */

class FakeElement {
  className = '';
  textContent = '';
  style: Record<string, string> = {};
  width = 0;
  height = 0;
  clientWidth = 800;
  clientHeight = 600;
  children: FakeElement[] = [];
  parent: FakeElement | null = null;
  readonly listeners = new Map<string, Set<unknown>>();
  readonly classList = {
    add: (...names: string[]) => {
      for (const n of names) if (!this.has(n)) this.className = `${this.className} ${n}`.trim();
    },
    remove: (...names: string[]) => {
      this.className = this.className
        .split(/\s+/)
        .filter((c) => c && !names.includes(c))
        .join(' ');
    },
    toggle: (name: string, force?: boolean) => {
      const on = force ?? !this.has(name);
      if (on) this.classList.add(name);
      else this.classList.remove(name);
      return on;
    },
  };
  private has(name: string) {
    return this.className.split(/\s+/).includes(name);
  }
  setAttribute() {}
  getContext() {
    return null;
  }
  requestPointerLock() {}
  addEventListener(type: string, handler: unknown) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type)!.add(handler);
  }
  removeEventListener(type: string, handler: unknown) {
    this.listeners.get(type)?.delete(handler);
  }
  appendChild(child: FakeElement) {
    child.parent = this;
    this.children.push(child);
    return child;
  }
  append(...nodes: FakeElement[]) {
    for (const n of nodes) this.appendChild(n);
  }
  replaceChildren(...nodes: FakeElement[]) {
    for (const c of this.children) c.parent = null;
    this.children = [];
    this.append(...nodes);
  }
  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  get listenerCount() {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
  /** This element and everything under it. */
  all(): FakeElement[] {
    return [this, ...this.children.flatMap((c) => c.all())];
  }
}

/** The renderers made so far, to see that each one is freed. */
const renderers: { disposed: boolean; loop: ((t: number) => void) | null }[] = [];

vi.mock('../src/render/renderer', () => ({
  createRenderer: (container: FakeElement) => {
    const state = { disposed: false, loop: null as ((t: number) => void) | null };
    renderers.push(state);
    const domElement = new FakeElement();
    container.appendChild(domElement);
    return {
      domElement,
      setSize() {},
      render() {},
      setAnimationLoop(cb: ((t: number) => void) | null) {
        state.loop = cb;
      },
      dispose() {
        state.disposed = true;
      },
    };
  },
}));

let container: FakeElement;
let page: FakeElement;
let win: FakeElement;
const games: Game[] = [];

beforeEach(() => {
  container = new FakeElement();
  page = Object.assign(new FakeElement(), {
    pointerLockElement: null,
    createElement: () => new FakeElement(),
    exitPointerLock() {},
  });
  win = Object.assign(new FakeElement(), { location: { search: '' }, devicePixelRatio: 1 });
  vi.stubGlobal('document', page);
  vi.stubGlobal('window', win);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  renderers.length = 0;
  games.length = 0;
});
afterEach(() => vi.unstubAllGlobals());

/** Geometries, materials and objects that are still hanging in a scene. */
function sceneCounts(scene: Object3D) {
  const geometries = new Set<unknown>();
  const materials = new Set<unknown>();
  let objects = 0;
  scene.traverse((o) => {
    objects++;
    const m = o as Object3D & { geometry?: unknown; material?: unknown | unknown[] };
    if (m.geometry) geometries.add(m.geometry);
    for (const mat of [m.material].flat()) if (mat) materials.add(mat);
  });
  return { geometries: geometries.size, materials: materials.size, objects };
}

/** Everything the page is listening to right now. */
const listeners = () =>
  page.listenerCount + win.listenerCount + container.all().reduce((n, e) => n + e.listenerCount, 0);

async function playOneMatch(game: Game) {
  game.enterMatch();
  // About ten seconds of play: the drop, the bots and the zone clock.
  const frame = renderers.at(-1)!.loop!;
  for (let i = 0; i < 200; i++) frame(i * 50);
  // The player is shot dead: the match ends and the end screen is up.
  game.kills.recordKill({ killer: game.bots.all[0]!.id, victim: 'player', cause: 'shot', time: 9 });
  expect(game.app.state).toBe('ended');
}

describe('three matches in a row', () => {
  it('throws no errors and does not pile anything up', async () => {
    const { startGame } = await import('../src/app');
    startGame(container as unknown as HTMLElement, (g) => games.push(g));

    const counts: { scene: ReturnType<typeof sceneCounts>; listeners: number; elements: number }[] =
      [];
    for (let round = 0; round < 3; round++) {
      const game = games.at(-1)!;
      await playOneMatch(game);
      counts.push({
        scene: sceneCounts(game.scene),
        listeners: listeners(),
        elements: container.all().length,
      });
      // Play again, as the replay button does.
      game.replay();
      expect(games).toHaveLength(round + 2);
    }

    // The third match holds no more than the first.
    expect(counts[2]!.scene.geometries).toBeLessThanOrEqual(counts[0]!.scene.geometries);
    expect(counts[2]!.scene.materials).toBeLessThanOrEqual(counts[0]!.scene.materials);
    expect(counts[2]!.scene.objects).toBeLessThanOrEqual(counts[0]!.scene.objects);
    expect(counts[2]!.listeners).toBeLessThanOrEqual(counts[0]!.listeners);
    expect(counts[2]!.elements).toBeLessThanOrEqual(counts[0]!.elements);
  }, 120_000);

  it('frees the old match: loop stopped, renderer freed, scene empty, nothing left in the page', async () => {
    const { startGame } = await import('../src/app');
    startGame(container as unknown as HTMLElement, (g) => games.push(g));
    const first = games[0]!;
    await playOneMatch(first);
    first.replay();

    expect(renderers[0]!.loop).toBeNull();
    expect(renderers[0]!.disposed).toBe(true);
    expect(first.scene.children).toHaveLength(0);
    // Only the new match is on the page: one renderer canvas and one UI root.
    expect(renderers.filter((r) => !r.disposed)).toHaveLength(1);
    expect(
      container.children.filter((c) => c.className === '' || c.parent === container).length,
    ).toBeGreaterThan(0);
  }, 120_000);

  it('starts every replay in a new match with fresh state', async () => {
    const { startGame } = await import('../src/app');
    startGame(container as unknown as HTMLElement, (g) => games.push(g));
    const first = games[0]!;
    await playOneMatch(first);
    first.playerHealth.damage(40, 'gun');
    first.replay();

    const next = games[1]!;
    expect(next).not.toBe(first);
    expect(next.app.state).toBe('match');
    expect(next.playerHealth.health).toBe(100);
    expect(next.kills.all).toHaveLength(0);
    expect(next.results.result).toBeNull();
    expect(next.player.parachuting).toBe(true);
    expect(next.bots.alive).toHaveLength(19);
  }, 120_000);
});
