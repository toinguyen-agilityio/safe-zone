/** The parts of the browser the check reads, so tests can pass a fake. */
export interface DeviceEnv {
  matchMedia?: (query: string) => { matches: boolean };
  navigator?: { maxTouchPoints?: number };
}

const matches = (env: DeviceEnv, query: string): boolean =>
  env.matchMedia?.(query).matches ?? false;

/**
 * True on a device whose main way of pointing is a touch screen: its primary pointer is coarse, or
 * it has touch points and no mouse or trackpad at all. A laptop with a touch screen and a
 * trackpad is a desktop and gives false.
 */
export function isTouchDevice(env: DeviceEnv = window): boolean {
  if (matches(env, '(pointer: coarse)')) return true;
  const touchPoints = env.navigator?.maxTouchPoints ?? 0;
  return (
    touchPoints > 0 && !matches(env, '(any-pointer: fine)') && !matches(env, '(pointer: fine)')
  );
}
