import type { EventBus } from '../core/events';
import { playHit, playPickup, playShot } from './sfx';

/** The sounds the system plays; tests pass fakes. */
export interface SoundSet {
  playShot: () => void;
  playHit: () => void;
  playPickup: () => void;
}

const REAL: SoundSet = {
  playShot: () => playShot(),
  playHit: () => playHit(),
  playPickup: () => playPickup(),
};

/** The player's own shots and the hits they land. Before the first click `sfx` plays nothing. */
const PLAYER_ID = 'player';

/** Play the shot sound on every `shot`, the hit sound on every hit the player lands, and the pickup sound on every item the player picks up. */
export function connectSounds(events: EventBus, sounds: SoundSet = REAL): () => void {
  const stopShot = events.on('shot', () => sounds.playShot());
  const stopHit = events.on('hit', (hit) => {
    if (hit.shooter === PLAYER_ID) sounds.playHit();
  });
  const stopPickup = events.on('pickup', (pickup) => {
    if (pickup.collector === PLAYER_ID) sounds.playPickup();
  });
  return () => {
    stopShot();
    stopHit();
    stopPickup();
  };
}
