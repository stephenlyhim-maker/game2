// ============================================================
// src/entities/Projectile.ts
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';

export class Projectile extends Phaser.GameObjects.Image {
  vx: number;
  vy: number;
  dmg: number;
  lifeMs = 4000;
  ageMs = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, vy: number, dmg: number) {
    super(scene, x, y, 'projectile');
    this.vx = vx;
    this.vy = vy;
    this.dmg = dmg;

    scene.add.existing(this);
    this.setDepth(DEPTH.PROJECTILE);
  }

  update(dtMs: number): void {
    const dt = dtMs / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.ageMs += dtMs;
    this.lifeMs -= dtMs;

    this.angle += 240 * dt;
    this.setAlpha(0.85 + Math.sin(this.ageMs * 0.02) * 0.15);
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 5, this.y - 5, 10, 10);
  }
}