// ============================================================
// src/entities/Enemy.ts
// Base class. Subclasses override updateBehavior().
// ============================================================

import Phaser from 'phaser';
import { PHYS, DEPTH } from '../config/GameConfig';
import type { EnemyDef } from '../config/Enemies';
import type { GameScene } from '../scenes/GameScene';
import type { Player } from './Player';

export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  private static nextId = 1;

  readonly id = Enemy.nextId++;
  readonly def: EnemyDef;
  readonly homeX: number;
  readonly baseY: number;

  hp: number;
  dead = false;
  dir: 1 | -1 = Math.random() < 0.5 ? -1 : 1;

  protected ageMs = 0;
  protected flashMs = 0;
  protected spawnMs = 220;
  protected lungeMs = 0;
  protected lungeDir: 1 | -1 = 1;
  protected lungeCdMs = 0;
  protected shootCdMs: number;

  constructor(scene: GameScene, x: number, y: number | undefined, def: EnemyDef) {
    const spawnY = y ?? scene.level.groundY - def.h;
    super(scene, x, spawnY, def.texture);

    this.def = def;
    this.hp = def.hp;
    this.homeX = x;
    this.baseY = spawnY;
    this.shootCdMs = 1200 + Math.random() * 1500;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0, 0);
    this.body.setSize(def.w, def.h);
    this.body.setOffset(0, 0);
    this.body.setAllowGravity(false);
    this.setDepth(DEPTH.ENEMY);

    scene.fx.burst(x + def.w / 2, spawnY + def.h / 2, 12, {
      speed: 100,
      speedVar: 60,
      lifeMs: 330,
      color: 0xc090ff,
    });
  }

  protected get game(): GameScene {
    return this.scene as GameScene;
  }

  get bounds(): Phaser.Geom.Rectangle {
    if (this.lungeMs > 0) {
      const extra = 18;
      return new Phaser.Geom.Rectangle(
        this.lungeDir > 0 ? this.x - 4 : this.x - extra + 4,
        this.y,
        this.def.w + extra,
        this.def.h,
      );
    }
    return new Phaser.Geom.Rectangle(this.x, this.y, this.def.w, this.def.h);
  }

  update(dtMs: number, player: Player): void {
    if (this.dead) return;

    this.ageMs += dtMs;
    if (this.flashMs > 0) {
      this.flashMs -= dtMs;
      if (this.flashMs <= 0) this.clearTint();
    }
    if (this.spawnMs > 0) this.spawnMs -= dtMs;

    this.setFlipX(this.dir < 0);
    this.updateBehavior(dtMs, player);
  }

  protected abstract updateBehavior(dtMs: number, player: Player): void;

  flash(durationMs = 90): void {
    this.flashMs = durationMs;
    this.setTintFill(0xffffff);
  }

  // ----------------------------------------------------------
  // Shared AI helpers
  // ----------------------------------------------------------

  protected walkerAI(dtMs: number, player: Player): void {
    const def = this.def;
    const dt = dtMs / 1000;

    const dx = player.x + player.width / 2 - (this.x + this.width / 2);
    const dy = player.y + player.height / 2 - (this.y + this.height / 2);
    let vx: number;

    if (this.lungeMs > 0) {
      this.lungeMs -= dtMs;
      vx = this.lungeDir * (def.lunge?.speed ?? def.speed);
    } else {
      if (this.lungeCdMs > 0) this.lungeCdMs -= dtMs;

      const aggro = def.aggroRange ?? 175;
      const aggroHeight = def.aggroHeight ?? 90;
      const patrol = def.patrolRange ?? 80;

      if (Math.abs(dx) < aggro && Math.abs(dy) < aggroHeight) {
        this.dir = dx >= 0 ? 1 : -1;
      } else {
        if (this.x < this.homeX - patrol) this.dir = 1;
        if (this.x > this.homeX + patrol) this.dir = -1;
      }

      const canLunge =
        def.lunge &&
        this.lungeCdMs <= 0 &&
        Math.abs(dx) < def.lunge.range &&
        Math.abs(dy) < def.lunge.height;

      if (canLunge && def.lunge) {
        this.lungeMs = def.lunge.durationMs;
        this.lungeDir = dx >= 0 ? 1 : -1;
        this.lungeCdMs = def.lunge.cooldownMs;
        vx = 0;
      } else {
        vx = this.dir * def.speed;
      }
    }

    this.body.velocity.x = vx;

    let vy = this.body.velocity.y + PHYS.GRAVITY * dt;
    if (vy > PHYS.MAX_FALL) vy = PHYS.MAX_FALL;
    this.body.velocity.y = vy;
  }

  protected flyerAI(dtMs: number, player: Player): void {
    const def = this.def;
    const dt = dtMs / 1000;

    const bob = def.bob ?? { amplitude: 9, speed: 0.0036 };
    this.y = this.baseY + Math.sin(this.ageMs * bob.speed) * bob.amplitude;

    const dx = player.x + player.width / 2 - (this.x + this.width / 2);
    const dy = player.y + player.height / 2 - (this.y + this.height / 2);
    const dist = Math.abs(dx);

    this.dir = dx >= 0 ? 1 : -1;

    if (dist > 150 && dist < 540) {
      this.x += Math.sign(dx) * def.speed * dt;
    } else if (dist < 95) {
      this.x -= Math.sign(dx) * def.speed * 0.75 * dt;
    }

    if (def.shoot) {
      this.shootCdMs -= dtMs;
      if (this.shootCdMs <= 0 && Math.abs(dx) < def.shoot.range && Math.abs(dy) < def.shoot.height) {
        this.shootCdMs = def.shoot.cooldownMs + Math.random() * def.shoot.cooldownJitterMs;
        const len = Math.hypot(dx, dy) || 1;
        this.game.spawnProjectile(
          this.x + this.width / 2,
          this.y + this.height / 2,
          (dx / len) * def.shoot.speed,
          (dy / len) * def.shoot.speed,
          def.dmg,
        );
      }
    }
  }
}