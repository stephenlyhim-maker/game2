// ============================================================
// src/entities/Portal.ts
// Level exit.
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';
import type { GoalDef } from '../config/Levels';

export class Portal extends Phaser.GameObjects.Image {
  constructor(scene: Phaser.Scene, def: GoalDef) {
    super(scene, def.x, def.y, 'portal');
    scene.add.existing(this);
    this.setOrigin(0, 0);
    this.setDepth(DEPTH.FX);

    const glow = scene.add
      .image(def.x + def.w / 2, def.y + def.h / 2, 'portal')
      .setOrigin(0.5)
      .setDepth(DEPTH.FX - 1)
      .setAlpha(0.25)
      .setScale(1.8)
      .setTint(0x7ae0ff);

    scene.tweens.add({
      targets: glow,
      alpha: { from: 0.15, to: 0.4 },
      scaleX: { from: 1.6, to: 2.0 },
      scaleY: { from: 1.6, to: 2.0 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
      targets: this,
      scaleX: { from: 0.95, to: 1.05 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
  }
}