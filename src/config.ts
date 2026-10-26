import { bots } from './config/bots';
import { combat } from './config/combat';
import { loot } from './config/loot';
import { player } from './config/player';
import { ui } from './config/ui';
import { world } from './config/world';
import { zone } from './config/zone';

export const config = { world, player, combat, bots, zone, loot, ui } as const;
