// ============================================================
// src/entities/Pickup.ts
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';
import type { PickupDef, PickupKind } from '../config/Levels';

export class Pickup extends Phaser.GameObjects.Image {
  readonly kind: PickupKind;
  readonly itemId?: string;
  readonly itemName?: string;
  readonly amount: number;
  readonly qty: number;
  taken = false;

  private baseY: number;
  private t = Math.random() * 6.28;

  constructor(scene: Phaser.Scene, def: PickupDef, qty = 1) {
    const textureKey =
      def.kind === 'quest'    ? 'pickup-quest'
      : def.kind === 'backpack' ? 'backpack'
      : def.kind === 'item'     ? 'pickup-item'
      : 'pickup-health';

    super(scene, def.x, def.y, textureKey);

    this.kind = def.kind ?? 'health';
    this.itemId = def.itemId;
    this.itemName = def.itemName;
    this.amount = this.kind === 'health' ? 25 : 0;
    this.qty = qty;
    this.baseY = def.y;

    scene.add.existing(this);
    this.setOrigin(0, 0);
    this.setDepth(DEPTH.PICKUP);
  }

  update(dtMs: number): void {
    if (this.taken) return;
    this.t += (dtMs / 1000) * 3.6;
    this.y = this.baseY + Math.sin(this.t) * 2.5;
    this.setAlpha(0.85 + Math.sin(this.t * 2) * 0.15);
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, 14, 14);
  }
}