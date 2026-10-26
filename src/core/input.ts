export interface InputElement extends EventTarget {
  requestPointerLock?: () => void;
}

export interface InputDocument extends EventTarget {
  pointerLockElement: unknown;
}

export interface MouseDelta {
  x: number;
  y: number;
}

/**
 * Keys, mouse buttons and mouse movement for first-person play. Takes the page's document and
 * canvas as arguments so tests can drive it with synthetic events.
 */
export class Input {
  private readonly keys = new Set<string>();
  private readonly buttons = new Set<number>();
  private readonly clickHandlers = new Set<() => void>();
  private deltaX = 0;
  private deltaY = 0;
  /**
   * Browsers can report a large jump in a mouse event right as the lock starts, before or after
   * the lock change event. Movement counts only once the lock change was seen, and the first
   * event after it is dropped too.
   */
  private engaged = false;
  private skipNextMove = false;

  constructor(
    private readonly doc: InputDocument,
    private readonly element: InputElement,
  ) {
    this.listen(doc, 'keydown', (e) => this.keys.add((e as KeyboardEvent).code));
    this.listen(doc, 'keyup', (e) => this.keys.delete((e as KeyboardEvent).code));
    this.listen(doc, 'mousedown', (e) => this.buttons.add((e as MouseEvent).button));
    this.listen(doc, 'mouseup', (e) => this.buttons.delete((e as MouseEvent).button));
    this.listen(doc, 'mousemove', (e) => this.onMouseMove(e as MouseEvent));
    this.listen(doc, 'pointerlockchange', () => this.onPointerLockChange());
    this.listen(element, 'click', () => this.handleClick());
  }

  private readonly removers: (() => void)[] = [];

  private listen(target: EventTarget, type: string, handler: (event: Event) => void): void {
    target.addEventListener(type, handler);
    this.removers.push(() => target.removeEventListener(type, handler));
  }

  /** Take every listener off the page, for example when a new match replaces this one. */
  dispose(): void {
    for (const remove of this.removers.splice(0)) remove();
    this.clickHandlers.clear();
  }

  get pointerLocked(): boolean {
    return this.doc.pointerLockElement === this.element;
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  isMouseDown(button: number): boolean {
    return this.buttons.has(button);
  }

  /** Movement since the last call; only counted while the pointer is locked. */
  consumeMouseDelta(): MouseDelta {
    const delta = { x: this.deltaX, y: this.deltaY };
    this.deltaX = 0;
    this.deltaY = 0;
    return delta;
  }

  /** Registers a handler for clicks on the game. Returns a function that removes it. */
  onClick(handler: () => void): () => void {
    this.clickHandlers.add(handler);
    return () => {
      this.clickHandlers.delete(handler);
    };
  }

  private handleClick(): void {
    if (!this.pointerLocked) this.element.requestPointerLock?.();
    for (const handler of this.clickHandlers) handler();
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.pointerLocked || !this.engaged) return;
    if (this.skipNextMove) {
      this.skipNextMove = false;
      return;
    }
    this.deltaX += event.movementX;
    this.deltaY += event.movementY;
  }

  /** Releasing the mouse (Esc) must not leave keys stuck down. */
  private onPointerLockChange(): void {
    if (this.pointerLocked) {
      this.engaged = true;
      this.skipNextMove = true;
      return;
    }
    this.engaged = false;
    this.skipNextMove = false;
    this.keys.clear();
    this.buttons.clear();
    this.deltaX = 0;
    this.deltaY = 0;
  }
}
