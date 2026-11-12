// ============================================================
// src/scenes/GameScene.ts
// The main gameplay scene.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYS, PLAYER, DEPTH, SCENES } from '../config/GameConfig';
import { LEVELS, type LevelDef } from '../config/Levels';
import { DEFAULT_LEVEL } from '../config/Levels';
import type { EnemyType } from '../config/Enemies';
import { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import { createEnemy } from '../entities/enemies';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';
import { Portal } from '../entities/Portal';
import { Background } from '../gfx/Background';
import { ParticleSystem } from '../systems/ParticleSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { InputManager } from '../systems/InputManager';
import { EventBus, EV, computeRank, type PlayerStatsPayload } from '../core/EventBus';

export class GameScene extends Phaser.Scene {
  level!: LevelDef;
  player!: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  pickups: Pickup[] = [];
  portal!: Portal;
  fx!: ParticleSystem;

  isOver = false;
  private isWin = false;
  private elapsedMs = 0;
  private hitStopMs = 0;

  private background!: Background;
  private inputMgr!: InputManager;
  private waves!: WaveSystem;
  private platformGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private platformRects: Phaser.Geom.Rectangle[] = [];
  private specialGfx!: Phaser.GameObjects.Graphics;
  private lastStats: PlayerStatsPayload | null = null;

  constructor() {
    super(SCENES.GAME);
  }

  create(): void {
    this.isOver = false;
    this.isWin = false;
    this.elapsedMs = 0;
    this.hitStopMs = 0;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.platformRects = [];
    this.lastStats = null;

    this.level = LEVELS[DEFAULT_LEVEL];

    this.physics.world.setBounds(0, -400, this.level.width, 1200);
    this.cameras.main.setBounds(0, -60, this.level.width, 420);
    this.cameras.main.setBackgroundColor('#07050c');

    this.background = new Background(this);
    this.fx = new ParticleSystem(this, 'pixel', 600);

    this.buildTerrain();

    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y);
    this.cameras.main.startFollow(this.player, true, 0.13, 0.09);

    this.portal = new Portal(this, this.level.goal);
    this.pickups = this.level.pickups.map((p) => new Pickup(this, p));

    this.specialGfx = this.add.graphics().setDepth(DEPTH.FX);

    this.inputMgr = new InputManager(this);
    this.waves = new WaveSystem(this.level.waves, (type, x, y) => this.spawnEnemy(type, x, y));

    if (!this.scene.isActive(SCENES.UI)) {
      this.scene.launch(SCENES.UI);
    }

    EventBus.emit(EV.RUN_STARTED);
    EventBus.emit(EV.HINT, {
      text: 'A / D  move     W  jump (x2 + hover)     J  dash     K  sweep',
      durationMs: 7000,
    });

    this.emitStats();
    this.cameras.main.fadeIn(250, 0, 0, 0);
  }

  // ----------------------------------------------------------

  private buildTerrain(): void {
    this.platformGroup = this.physics.add.staticGroup();

    const ground = this.add
      .tileSprite(0, this.level.groundY, this.level.width, 120, 'ground')
      .setOrigin(0, 0)
      .setDepth(DEPTH.TERRAIN);

    this.platformGroup.add(ground);
    this.platformRects.push(new Phaser.Geom.Rectangle(0, this.level.groundY, this.level.width, 120));

    for (const p of this.level.platforms) {
      if (p.ground) continue;
      const ts = this.add
        .tileSprite(p.x, p.y, p.w, p.h, 'platform')
        .setOrigin(0, 0)
        .setDepth(DEPTH.TERRAIN + 1);
      this.platformGroup.add(ts);
      this.platformRects.push(new Phaser.Geom.Rectangle(p.x, p.y, p.w, p.h));
    }

    this.enemyGroup = this.physics.add.group();
    this.physics.add.collider(this.enemyGroup, this.platformGroup);
  }

  spawnEnemy(type: EnemyType, x: number, y?: number): void {
    const enemy = createEnemy(this, type, x, y);
    this.enemies.push(enemy);
    if (enemy.def.ai === 'walker') {
      this.enemyGroup.add(enemy);
    }
  }

  spawnProjectile(x: number, y: number, vx: number, vy: number, dmg: number): void {
    this.projectiles.push(new Projectile(this, x, y, vx, vy, dmg));
  }

  // ----------------------------------------------------------
  // Combat API (used by Player & enemies)
  // ----------------------------------------------------------

  damageEnemy(enemy: Enemy, dmg: number): void {
    if (enemy.dead) return;

    enemy.hp -= dmg;
    enemy.flash();

    if (enemy.hp <= 0) {
      enemy.dead = true;
      this.player.kills++;
      this.player.xp += enemy.def.xp;
      this.fx.death(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.def.color);
      this.shake(5);
      this.addHitStop(40);
      enemy.destroy();
      this.enemies = this.enemies.filter((e) => e !== enemy);
    } else {
      this.fx.hitSpark(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      this.shake(1.8);
      this.addHitStop(20);
    }

    this.emitStats();
  }

  addHitStop(ms: number): void {
    this.hitStopMs = Math.max(this.hitStopMs, ms);
  }

  shake(amount: number): void {
    this.cameras.main.shake(120, amount * 0.002);
  }

  onPlayerHurt(): void {
    this.shake(9);
    this.addHitStop(60);
    this.cameras.main.flash(120, 255, 40, 60, false);
    this.emitStats();
  }

  onPlayerDeath(): void {
    if (this.isOver) return;
    this.isOver = true;
    this.shake(14);
    this.fx.burst(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 40, {
      speed: 120,
      speedVar: 300,
      lifeMs: 800,
      color: 0xff6070,
      gravity: 250,
    });
    this.player.setVisible(false);
    this.endRun(false);
  }

  private endRun(win: boolean): void {
    this.isWin = win;
    this.time.delayedCall(500, () => {
      EventBus.emit(EV.RUN_ENDED, {
        win,
        timeSec: this.elapsedMs / 1000,
        kills: this.player.kills,
        xp: this.player.xp,
        rank: computeRank(this.player.kills, this.player.xp),
      });
    });
  }

  private emitStats(): void {
    const stats: PlayerStatsPayload = {
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      special: this.player.special,
      specialReady: this.player.specialReady,
      xp: this.player.xp,
      kills: this.player.kills,
    };

    const prev = this.lastStats;
    if (
      prev &&
      prev.hp === stats.hp &&
      prev.special === stats.special &&
      prev.xp === stats.xp &&
      prev.kills === stats.kills
    ) {
      return;
    }

    this.lastStats = stats;
    EventBus.emit(EV.PLAYER_STATS, stats);
  }

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

  override update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50);
    this.inputMgr.update();

    if (this.isOver) {
      if (this.inputMgr.justPressed('restart') || this.inputMgr.justPressed('confirm')) {
        this.restartRun();
      }
      this.fx.update(dtMs);
      return;
    }

    if (this.hitStopMs > 0) {
      this.hitStopMs -= dtMs;
      return;
    }

    this.elapsedMs += dtMs;

    this.player.update(dtMs, this.inputMgr);
    this.updateEnemies(dtMs);
    this.updateProjectiles(dtMs);
    this.updatePickups(dtMs);

    this.waves.update(this.player.x);
    this.fx.update(dtMs);

    this.updateSpecialGfx();

    const cam = this.cameras.main;
    this.background.update(cam.scrollX, cam.scrollY);

    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.bounds, this.portal.bounds)) {
      this.isOver = true;
      this.endRun(true);
    }

    this.emitStats();
  }

  private updateEnemies(dtMs: number): void {
    const playerBounds = this.player.bounds;

    for (const e of this.enemies) {
      if (e.dead) continue;
      e.update(dtMs, this.player);

      if (!this.player.isInvulnerable) {
        if (Phaser.Geom.Intersects.RectangleToRectangle(e.bounds, playerBounds)) {
          this.player.hurt(e.def.dmg, e.x + e.width / 2);
        }
      }
    }
  }

  private updateProjectiles(dtMs: number): void {
    const playerBounds = this.player.bounds;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.update(dtMs);

      let gone =
        pr.lifeMs <= 0 ||
        pr.x < -60 ||
        pr.x > this.level.width + 60 ||
        pr.y > this.level.groundY + 60;

      if (!gone) {
        for (const r of this.platformRects) {
          if (Phaser.Geom.Rectangle.Contains(r, pr.x, pr.y)) {
            gone = true;
            break;
          }
        }
      }

      if (!gone && Phaser.Geom.Intersects.RectangleToRectangle(pr.bounds, playerBounds)) {
        this.player.hurt(pr.dmg, pr.x);
        gone = true;
      }

      if (gone) {
        this.fx.burst(pr.x, pr.y, 5, { speed: 40, speedVar: 80, lifeMs: 200, color: 0xc090ff });
        pr.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updatePickups(dtMs: number): void {
    const playerBounds = this.player.bounds;

    for (const pk of this.pickups) {
      if (pk.taken) continue;
      pk.update(dtMs);

      if (Phaser.Geom.Intersects.RectangleToRectangle(pk.bounds, playerBounds)) {
        pk.taken = true;
        pk.setVisible(false);
        this.player.heal(pk.amount);
        this.fx.burst(pk.x + 6, pk.y + 6, 16, {
          speed: 60,
          speedVar: 120,
          lifeMs: 380,
          color: 0x60ff90,
          gravity: 60,
        });
        this.emitStats();
      }
    }
  }

  private updateSpecialGfx(): void {
    const g = this.specialGfx;
    g.clear();

    const p = this.player;
    if (p.specialMs <= 0) return;

    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;
    const prog = 1 - p.specialMs / PLAYER.SPECIAL_MS;
    const facingAngle = p.facing > 0 ? 0 : Math.PI;
    const halfArc = PLAYER.SPECIAL_ARC / 2;
    const startAngle = facingAngle - halfArc;
    const curAngle = startAngle + PLAYER.SPECIAL_ARC * Math.min(1, prog * 1.35);
    const fade = Math.max(0, 1 - prog * 0.55);

    g.fillStyle(0xb090ff, 0.2 * fade);
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, PLAYER.SPECIAL_RADIUS, startAngle, curAngle, false);
    g.closePath();
    g.fillPath();

    for (let a = startAngle; a <= curAngle; a += 0.055) {
      const r = 92 + Math.sin(a * 9 + this.elapsedMs * 0.02) * 7;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      g.fillStyle(0xd8c0ff, 0.85 * fade);
      g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 3);
      g.fillStyle(0xffffff, 0.5 * fade);
      g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 1, 1);
    }

    const bx = cx + Math.cos(curAngle) * 74;
    const by = cy + Math.sin(curAngle) * 74;
    g.save();
    g.translateCanvas(bx, by);
    g.rotateCanvas(curAngle);
    g.fillStyle(0xe8f0ff, fade);
    g.fillRect(-34, -3, 62, 6);
    g.fillStyle(0xffffff, fade);
    g.fillRect(-30, -1, 54, 2);
    g.fillStyle(0xc8b070, fade);
    g.fillRect(-42, -5, 10, 10);
    g.fillStyle(0x6a5a3a, fade);
    g.fillRect(-50, -2, 10, 4);
    g.restore();
  }

  private restartRun(): void {
    this.scene.restart();
  }
}