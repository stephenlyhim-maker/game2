// ============================================================
// src/entities/Pickup.ts
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';
import type { PickupDef } from '../config/Levels';

export class Pickup extends Phaser.GameObjects.Image {
  readonly kind: 'health';
  readonly amount: number;
  taken = false;

  private baseY: number;
  private t = Math.random() * 6.28;

  constructor(scene: Phaser.Scene, def: PickupDef) {
    super(scene, def.x, def.y, 'pickup-health');
    this.kind = def.kind ?? 'health';
    this.amount = 25;
    this.baseY = def.y;

    scene.add.existing(this);
    this.setOrigin(0, 0);
    this.setDepth(DEPTH.PICKUP);
    this.setBlendMode(Phaser.BlendModes.NORMAL);
  }

  update(dtMs: number): void {
    if (this.taken) return;
    this.t += (dtMs / 1000) * 3.6;
    this.y = this.baseY + Math.sin(this.t) * 2.5;
    this.setAlpha(0.85 + Math.sin(this.t * 2) * 0.15);
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, 12, 12);
  }
}