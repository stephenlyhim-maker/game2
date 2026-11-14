// ============================================================
// src/entities/Portal.ts
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';
import type { GoalDef } from '../config/Levels';

export type PortalKind = 'goal' | 'return';

export class Portal extends Phaser.GameObjects.Image {
  readonly kind: PortalKind;

  constructor(scene: Phaser.Scene, def: GoalDef, kind: PortalKind = 'goal') {
    const texture = kind === 'return' ? 'portal-return' : 'portal';
    super(scene, def.x, def.y, texture);
    this.kind = kind;

    scene.add.existing(this);
    this.setOrigin(0, 0);
    this.setDepth(DEPTH.FX);

    const tint = kind === 'return' ? 0x8affa0 : 0x7ae0ff;
    const glow = scene.add
      .image(def.x + def.w / 2, def.y + def.h / 2, texture)
      .setOrigin(0.5)
      .setDepth(DEPTH.FX - 1)
      .setAlpha(0.25)
      .setScale(1.6)
      .setTint(tint);

    scene.tweens.add({
      targets: glow,
      alpha: { from: 0.15, to: 0.4 },
      scaleX: { from: 1.5, to: 1.9 },
      scaleY: { from: 1.5, to: 1.9 },
      duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
  }
}