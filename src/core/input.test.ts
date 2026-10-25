import { describe, expect, it } from 'vitest';
import { Input, type InputDocument, type InputElement } from './input';

class FakeDocument extends EventTarget implements InputDocument {
  pointerLockElement: unknown = null;
}

class FakeElement extends EventTarget implements InputElement {
  lockRequests = 0;
  requestPointerLock = () => {
    this.lockRequests++;
  };
}

const event = (type: string, props: object = {}) => Object.assign(new Event(type), props);

const setup = () => {
  const doc = new FakeDocument();
  const element = new FakeElement();
  const input = new Input(doc, element);
  /** Locks the pointer. `settle` sends the jumpy first event browsers may report right after. */
  const lock = (settle = true) => {
    doc.pointerLockElement = element;
    doc.dispatchEvent(event('pointerlockchange'));
    if (settle) doc.dispatchEvent(event('mousemove', { movementX: -500, movementY: -350 }));
  };
  const unlock = () => {
    doc.pointerLockElement = null;
    doc.dispatchEvent(event('pointerlockchange'));
  };
  return { doc, element, input, lock, unlock };
};

describe('Input keys', () => {
  it('tracks pressed keys by code', () => {
    const { doc, input } = setup();
    doc.dispatchEvent(event('keydown', { code: 'KeyW' }));
    expect(input.isDown('KeyW')).toBe(true);
    expect(input.isDown('KeyS')).toBe(false);
    doc.dispatchEvent(event('keyup', { code: 'KeyW' }));
    expect(input.isDown('KeyW')).toBe(false);
  });

  it('clears keys and buttons when the pointer lock is lost', () => {
    const { doc, input, lock, unlock } = setup();
    lock();
    doc.dispatchEvent(event('keydown', { code: 'KeyW' }));
    doc.dispatchEvent(event('mousedown', { button: 0 }));
    expect(input.isDown('KeyW')).toBe(true);
    expect(input.isMouseDown(0)).toBe(true);
    unlock();
    expect(input.isDown('KeyW')).toBe(false);
    expect(input.isMouseDown(0)).toBe(false);
  });
});

describe('Input mouse', () => {
  it('tracks mouse buttons', () => {
    const { doc, input } = setup();
    doc.dispatchEvent(event('mousedown', { button: 2 }));
    expect(input.isMouseDown(2)).toBe(true);
    doc.dispatchEvent(event('mouseup', { button: 2 }));
    expect(input.isMouseDown(2)).toBe(false);
  });

  it('adds up movement while locked and resets it when consumed', () => {
    const { doc, input, lock } = setup();
    lock();
    doc.dispatchEvent(event('mousemove', { movementX: 3, movementY: -2 }));
    doc.dispatchEvent(event('mousemove', { movementX: 4, movementY: 5 }));
    expect(input.consumeMouseDelta()).toEqual({ x: 7, y: 3 });
    expect(input.consumeMouseDelta()).toEqual({ x: 0, y: 0 });
  });

  it('ignores movement while the pointer is not locked', () => {
    const { doc, input } = setup();
    doc.dispatchEvent(event('mousemove', { movementX: 10, movementY: 10 }));
    expect(input.consumeMouseDelta()).toEqual({ x: 0, y: 0 });
  });

  it('drops pending movement when the pointer lock is lost', () => {
    const { doc, input, lock, unlock } = setup();
    lock();
    doc.dispatchEvent(event('mousemove', { movementX: 5, movementY: 5 }));
    unlock();
    expect(input.consumeMouseDelta()).toEqual({ x: 0, y: 0 });
  });
});

describe('Input first move after lock', () => {
  it('ignores the jumpy first mouse event after the lock starts', () => {
    const { doc, input, lock } = setup();
    lock(false);
    doc.dispatchEvent(event('mousemove', { movementX: -500, movementY: -350 }));
    doc.dispatchEvent(event('mousemove', { movementX: 2, movementY: 3 }));
    expect(input.consumeMouseDelta()).toEqual({ x: 2, y: 3 });
  });

  it('ignores it again after a second lock', () => {
    const { doc, input, lock, unlock } = setup();
    lock();
    unlock();
    lock(false);
    doc.dispatchEvent(event('mousemove', { movementX: 900, movementY: 900 }));
    expect(input.consumeMouseDelta()).toEqual({ x: 0, y: 0 });
  });
});

describe('Input pointer lock and clicks', () => {
  it('reports the pointer lock state', () => {
    const { input, lock, unlock } = setup();
    expect(input.pointerLocked).toBe(false);
    lock();
    expect(input.pointerLocked).toBe(true);
    unlock();
    expect(input.pointerLocked).toBe(false);
  });

  it('asks for the pointer lock on click only when not locked', () => {
    const { element, lock } = setup();
    element.dispatchEvent(event('click'));
    expect(element.lockRequests).toBe(1);
    lock();
    element.dispatchEvent(event('click'));
    expect(element.lockRequests).toBe(1);
  });

  it('calls click handlers until they are removed', () => {
    const { element, input } = setup();
    let clicks = 0;
    const remove = input.onClick(() => clicks++);
    element.dispatchEvent(event('click'));
    remove();
    element.dispatchEvent(event('click'));
    expect(clicks).toBe(1);
  });
});
