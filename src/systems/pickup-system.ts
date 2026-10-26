import { config } from '../config';
import type { EventBus } from '../core/events';
import type { Inventory } from '../entities/inventory';
import type { LootItem } from '../world/loot-spawn';

export interface PickupEvent {
  item: LootItem;
  collector: string;
}

declare module '../core/events' {
  interface EventMap {
    pickup: PickupEvent;
  }
}

/** The items lying on the ground. A picked up item leaves the list. */
export class PickupSystem {
  private readonly ground: LootItem[];

  constructor(
    items: readonly LootItem[],
    private readonly events: EventBus,
  ) {
    this.ground = [...items];
  }

  get items(): readonly LootItem[] {
    return this.ground;
  }

  /**
   * Take every item within reach of the position that the inventory has room for. An item that
   * does not fit (the bag is full of it) stays where it is. Returns the items picked up.
   */
  update(
    position: { x: number; z: number },
    inventory: Inventory,
    collector = 'player',
  ): LootItem[] {
    const reach = config.loot.pickupRadius;
    const taken: LootItem[] = [];
    for (let i = this.ground.length - 1; i >= 0; i--) {
      const item = this.ground[i]!;
      if (Math.hypot(item.x - position.x, item.z - position.z) > reach) continue;
      if (!inventory.addItem(item.type)) continue;
      this.ground.splice(i, 1);
      taken.push(item);
      this.events.emit('pickup', { item, collector });
    }
    return taken;
  }
}
