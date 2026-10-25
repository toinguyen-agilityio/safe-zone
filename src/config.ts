import { combat } from './config/combat';
import { player } from './config/player';
import { world } from './config/world';

export const config = { world, player, combat } as const;
