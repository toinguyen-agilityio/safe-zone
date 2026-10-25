import type { Inventory } from '../entities/inventory';
import type { Weapon } from '../entities/weapon';

/**
 * Keeps the rifle's reserve and the ammo in the bag the same number. The bag is where ammo boxes
 * go and where the carry limit of 180 applies; the rifle takes rounds from its reserve when it
 * reloads. Call `update` every frame, after the pickups and the weapon have run.
 */
export class AmmoSync {
  private last: number;

  constructor(
    private readonly weapon: Weapon,
    private readonly inventory: Inventory,
  ) {
    // The rounds the player starts with are carried in the bag.
    inventory.give('ammo', weapon.reserve);
    this.last = weapon.reserve;
  }

  update(): void {
    const { weapon, inventory } = this;
    if (weapon.reserve < this.last) {
      // A reload moved rounds from the reserve into the magazine.
      inventory.take('ammo', this.last - weapon.reserve);
    }
    // Picking up an ammo box, or any other change to the bag, shows in the rifle's reserve.
    weapon.reserve = inventory.count('ammo');
    this.last = weapon.reserve;
  }
}
