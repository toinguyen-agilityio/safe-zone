import { describe, expect, it } from 'vitest';
import { EventBus } from '../core/events';
import { Pause } from '../core/pause';
import { createPlayer } from '../entities/player';
import css from './ui-root.css?raw';
import { createUiRoot, loadWidgets, mountUi, mountWidgets, type UiContext } from './mount';

const fakeRoot = () => ({ id: '', remove: () => {} }) as unknown as HTMLElement;

const makeContext = (): UiContext => ({
  root: fakeRoot(),
  events: new EventBus(),
  player: createPlayer(),
  pause: new Pause(),
  requestPointerLock: () => {},
});

describe('createUiRoot', () => {
  it('creates #ui-root and adds it to the parent', () => {
    const added: unknown[] = [];
    const root = createUiRoot(
      { appendChild: (node) => added.push(node) },
      { createElement: fakeRoot },
    );
    expect(root.id).toBe('ui-root');
    expect(added).toEqual([root]);
  });
});

describe('mountWidgets', () => {
  it('mounts two fake widgets with the same context and removes them in reverse order', () => {
    const ctx = makeContext();
    const log: string[] = [];
    const seen: UiContext[] = [];
    const unmount = mountWidgets(ctx, [
      {
        mount: (c) => {
          seen.push(c);
          log.push('mount a');
          return () => log.push('unmount a');
        },
      },
      {
        mount: (c) => {
          seen.push(c);
          log.push('mount b');
        },
      },
      {
        mount: () => () => log.push('unmount c'),
      },
    ]);
    expect(seen).toEqual([ctx, ctx]);
    expect(log).toEqual(['mount a', 'mount b']);
    unmount();
    expect(log).toEqual(['mount a', 'mount b', 'unmount c', 'unmount a']);
  });

  it('gives widgets the event bus, so they can listen to game events', () => {
    const ctx = makeContext();
    let widgetSawContext: UiContext | undefined;
    mountWidgets(ctx, [{ mount: (c) => void (widgetSawContext = c) }]);
    expect(widgetSawContext!.events).toBe(ctx.events);
    expect(widgetSawContext!.player).toBe(ctx.player);
    expect(widgetSawContext!.pause).toBe(ctx.pause);
  });
});

describe('loadWidgets', () => {
  it('returns widget modules and skips test files', () => {
    const widgets = loadWidgets();
    expect(Array.isArray(widgets)).toBe(true);
    for (const widget of widgets) expect(typeof widget.mount).toBe('function');
  });
});

describe('mountUi', () => {
  it('adds the root, mounts the given widgets and removes everything on cleanup', () => {
    const added: unknown[] = [];
    let removed = false;
    const parent = { appendChild: (node: unknown) => added.push(node) } as unknown as HTMLElement;
    const originalDocument = (globalThis as { document?: unknown }).document;
    (globalThis as { document?: unknown }).document = {
      createElement: () => ({ id: '', remove: () => (removed = true) }),
    };
    try {
      let mounted = 0;
      const unmount = mountUi(
        parent,
        {
          events: new EventBus(),
          player: createPlayer(),
          pause: new Pause(),
          requestPointerLock: () => {},
        },
        [{ mount: () => void mounted++ }],
      );
      expect(added).toHaveLength(1);
      expect(mounted).toBe(1);
      unmount();
      expect(removed).toBe(true);
    } finally {
      (globalThis as { document?: unknown }).document = originalDocument;
    }
  });
});

describe('ui-root.css', () => {
  it('lets mouse events through the overlay unless a widget opts in', () => {
    expect(css).toMatch(/#ui-root\s*{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(/\.ui-interactive\s*{[^}]*pointer-events:\s*auto/);
  });
});
