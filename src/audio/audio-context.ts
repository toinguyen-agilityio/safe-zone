/** The part of an AudioContext the game needs here; the real one fits, tests pass a fake. */
export interface AudioLike {
  state: string;
  resume: () => Promise<void>;
}

type Factory = () => AudioLike;

let context: AudioLike | null = null;
let stop: (() => void) | null = null;

/** The running audio context, or null until the player has clicked. Sounds skip while null. */
export function getAudio(): AudioContext | null {
  return context as AudioContext | null;
}

/**
 * Browsers only let audio start after a user gesture, so the context is created on the first
 * click on `target` and never before. Calling it again does nothing while waiting or once started.
 */
export function installAudio(
  target: Pick<EventTarget, 'addEventListener' | 'removeEventListener'>,
  factory: Factory = () => new AudioContext(),
): void {
  if (context || stop) return;
  const onClick = () => {
    stop?.();
    context = factory();
    if (context.state === 'suspended') void context.resume();
  };
  target.addEventListener('click', onClick);
  stop = () => {
    target.removeEventListener('click', onClick);
    stop = null;
  };
}

/** Forget the context and any waiting listener. For tests. */
export function resetAudio(): void {
  stop?.();
  context = null;
}
