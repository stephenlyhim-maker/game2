// ============================================================
// src/entities/Player.ts
// ============================================================

import Phaser from 'phaser';
import { PHYS, PLAYER, DEPTH } from '../config/GameConfig';
import { CHARACTERS, DEFAULT_CHARACTER } from '../config/Characters';
import type { InputManager } from '../systems/InputManager';
import type { GameScene } from '../scenes/GameScene';
import type { Enemy } from './Enemy';

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  hp = PLAYER.MAX_HP;
  maxHp = PLAYER.MAX_HP;
  xp = 0;
  kills = 0;

  facing: 1 | -1 = 1;
  private jumps = 0;
  private hoverMs = 0;
  private onGround = false;

  dashMs = 0;
  private dashCdMs = 0;
  private dashDir: 1 | -1 = 1;
  private dashHits = new Set<number>();

  special = 0;
  specialMs = 0;
  private specialApplied = false;

  invulnMs = 0;
  private hurtFlashMs = 0;

  private runMax: number;
  private jumpVel: number;
  private ghostTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, characterId = DEFAULT_CHARACTER) {
    const def = CHARACTERS[characterId] ?? CHARACTERS[DEFAULT_CHARACTER];
    super(scene, x, y, def.texture);

    this.maxHp = def.maxHp;
    this.hp = def.maxHp;
    this.runMax = def.runSpeed;
    this.jumpVel = def.jumpVelocity;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0, 0);
    this.body.setSize(PLAYER.W, PLAYER.H);
    this.body.setOffset(0, 0);
    this.body.setAllowGravity(false);
    this.body.setCollideWorldBounds(true);
    this.setDepth(DEPTH.PLAYER);
  }

  private get game(): GameScene {
    return this.scene as GameScene;
  }

  get isDashing(): boolean {
    return this.dashMs > 0;
  }

  get isInvulnerable(): boolean {
    return this.invulnMs > 0 || this.dashMs > 0;
  }

  get specialReady(): boolean {
    return this.special >= 100;
  }

  get bounds(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
  }

  update(dtMs: number, input: InputManager): void {
    const dt = dtMs / 1000;

    if (this.invulnMs > 0) this.invulnMs -= dtMs;
    if (this.hurtFlashMs > 0) this.hurtFlashMs -= dtMs;
    if (this.dashCdMs > 0) this.dashCdMs -= dtMs;

    this.updateFlash();
    this.updateSpecial(dtMs);

    if (this.dashMs > 0) {
      this.updateDash(dtMs);
      return;
    }

    this.onGround = this.body.blocked.down || this.body.touching.down;

    this.updateHorizontal(dt, input);
    this.updateJumpAndGravity(dtMs, dt, input);
    this.updateAbilities(input);

    this.setFlipX(this.facing < 0);
    this.updateGhostTrail(dtMs);
  }

  // ----------------------------------------------------------

  private updateFlash(): void {
    if (this.hurtFlashMs > 0) {
      this.setTintFill(0xffffff);
      return;
    }
    if (this.invulnMs > 0 && Math.floor(this.invulnMs / 60) % 2 === 0) {
      this.setAlpha(0.45);
    } else {
      this.setAlpha(1);
    }
    this.clearTint();
  }

  private updateHorizontal(dt: number, input: InputManager): void {
    let dir = 0;
    if (input.isDown('left')) dir -= 1;
    if (input.isDown('right')) dir += 1;

    let vx = this.body.velocity.x;

    if (dir !== 0) {
      this.facing = dir > 0 ? 1 : -1;
      vx += dir * PHYS.RUN_ACCEL * dt;
      vx = Phaser.Math.Clamp(vx, -this.runMax, this.runMax);
    } else {
      vx *= Math.pow(PHYS.RUN_FRICTION_PER_FRAME, dt * 60);
      if (Math.abs(vx) < 4) vx = 0;
    }

    this.body.velocity.x = vx;
  }

  private updateJumpAndGravity(dtMs: number, dt: number, input: InputManager): void {
    let vy = this.body.velocity.y;

    if (input.justPressed('jump')) {
      if (this.onGround) {
        vy = this.jumpVel;
        this.jumps = 1;
        this.hoverMs = 0;
        this.game.fx.dust(this.x + this.width / 2, this.y + this.height);
      } else if (this.jumps < 2) {
        vy = PHYS.DOUBLE_JUMP;
        this.jumps = 2;
        this.hoverMs = PHYS.HOVER_MS;
        this.game.fx.burst(this.x + this.width / 2, this.y + this.height, 12, {
          speed: 90,
          speedVar: 40,
          lifeMs: 300,
          color: 0xa8e8ff,
        });
      }
    }

    let gravity = PHYS.GRAVITY;
    if (this.jumps >= 2 && this.hoverMs > 0 && vy > -36) {
      gravity = PHYS.HOVER_GRAVITY;
      this.hoverMs -= dtMs;
      if (Math.floor(this.hoverMs) % 50 < dtMs) {
        this.game.fx.emit(this.x + this.width / 2 + (Math.random() - 0.5) * 10, this.y + this.height, {
          vy: 20,
          lifeMs: 220,
          color: 0xbfe9ff,
        });
      }
    }

    vy += gravity * dt;
    if (vy > PHYS.MAX_FALL) vy = PHYS.MAX_FALL;
    this.body.velocity.y = vy;

    if (this.onGround) {
      this.jumps = 0;
      this.hoverMs = 0;
    }
  }

  private updateAbilities(input: InputManager): void {
    if (input.justPressed('dash') && this.dashCdMs <= 0 && this.game.dashEnabled) {
      this.startDash();
    }
    if (input.justPressed('special') && this.specialReady && this.specialMs <= 0) {
      this.startSpecial();
    }
  }

  // ----------------------------------------------------------
  // DASH
  // ----------------------------------------------------------

  private startDash(): void {
    this.dashMs = PLAYER.DASH_MS;
    this.dashCdMs = PLAYER.DASH_CD_MS;
    this.dashDir = this.facing;
    this.dashHits = new Set();
    this.body.velocity.y = 0;
    this.invulnMs = Math.max(this.invulnMs, PLAYER.DASH_INVULN_MS);
    this.setVisible(false);
    this.game.shake(2.5);

    for (let i = 0; i < 8; i++) {
      this.game.fx.emit(this.x + this.width / 2, this.y + this.height / 2 + (Math.random() - 0.5) * 14, {
        vx: -this.dashDir * (60 + Math.random() * 120),
        vy: (Math.random() - 0.5) * 90,
        lifeMs: 230,
        color: 0x8ce8ff,
      });
    }
  }

  private updateDash(dtMs: number): void {
    this.dashMs -= dtMs;
    this.body.velocity.x = this.dashDir * PLAYER.DASH_SPEED;
    this.body.velocity.y = 0;
    this.setFlipX(this.dashDir < 0);

    const hitbox = new Phaser.Geom.Rectangle(this.x - 11, this.y - 5, PLAYER.W + 22, PLAYER.H + 10);
    const enemies = this.game.enemies;
    for (const e of enemies) {
      if (e.dead || this.dashHits.has(e.id)) continue;
      if (Phaser.Geom.Intersects.RectangleToRectangle(hitbox, e.bounds)) {
        this.dashHits.add(e.id);
        this.game.damageEnemy(e, PLAYER.DASH_DMG);
        this.addSpecial(PLAYER.DASH_SPECIAL_GAIN);
      }
    }

    this.ghostTimer -= dtMs;
    if (this.ghostTimer <= 0) {
      this.ghostTimer = 30;
      this.spawnGhost(0.35);
    }

    if (this.dashMs <= 0) {
      this.setVisible(true);
      this.dashMs = 0;
    }
  }

  private spawnGhost(alpha: number): void {
    const ghost = this.scene.add
      .image(this.x, this.y, this.texture.key)
      .setOrigin(0, 0)
      .setFlipX(this.facing < 0)
      .setAlpha(alpha)
      .setTint(0x7ef0ff)
      .setDepth(DEPTH.PLAYER - 1);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 200,
      onComplete: () => ghost.destroy(),
    });
  }

  private updateGhostTrail(dtMs: number): void {
    this.ghostTimer -= dtMs;
    if (this.ghostTimer <= 0) this.ghostTimer = 0;
  }

  // ----------------------------------------------------------
  // SPECIAL
  // ----------------------------------------------------------

  private startSpecial(): void {
    this.special = 0;
    this.specialMs = PLAYER.SPECIAL_MS;
    this.specialApplied = false;
    this.game.shake(5);
    this.invulnMs = Math.max(this.invulnMs, 160);
  }

  private updateSpecial(dtMs: number): void {
    if (this.specialMs <= 0) return;
    this.specialMs -= dtMs;
    if (!this.specialApplied && this.specialMs <= PLAYER.SPECIAL_APPLY_REMAINING) {
      this.specialApplied = true;
      this.applySpecialDamage();
    }
    if (this.specialMs < 0) this.specialMs = 0;
  }

  private applySpecialDamage(): void {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const facingAngle = this.facing > 0 ? 0 : Math.PI;
    const halfArc = PLAYER.SPECIAL_ARC / 2;

    let hits = 0;
    for (const e of this.game.enemies) {
      if (e.dead) continue;
      const ex = e.x + e.width / 2;
      const ey = e.y + e.height / 2;
      const dx = ex - cx;
      const dy = ey - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > PLAYER.SPECIAL_RADIUS + Math.max(e.width, e.height) * 0.5) continue;

      let a = Math.atan2(dy, dx) - facingAngle;
      while (a > Math.PI) a -= Math.PI * 2;
      while (a < -Math.PI) a += Math.PI * 2;
      if (Math.abs(a) <= halfArc + 0.18) {
        this.game.damageEnemy(e, PLAYER.SPECIAL_DMG);
        hits++;
      }
    }

    if (hits > 0) {
      this.game.shake(8);
      this.game.addHitStop(60);
    }

    for (let i = 0; i < 26; i++) {
      const t = i / 26;
      const ang = facingAngle - halfArc + t * PLAYER.SPECIAL_ARC;
      const r = PLAYER.SPECIAL_RADIUS * 0.65;
      this.game.fx.emit(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, {
        vx: Math.cos(ang) * 180,
        vy: Math.sin(ang) * 180,
        lifeMs: 370,
        color: i % 2 ? 0xffffff : 0xc8b0ff,
      });
    }
  }

  addSpecial(amount: number): void {
    this.special = Math.min(100, this.special + amount);
  }

  // ----------------------------------------------------------
  // DAMAGE
  // ----------------------------------------------------------

  hurt(dmg: number, fromX: number): void {
    if (this.isInvulnerable || this.game.isOver) return;

    this.hp -= dmg;
    this.invulnMs = PLAYER.INVULN_MS;
    this.hurtFlashMs = 400;
    this.game.onPlayerHurt();

    const dir = Math.sign(this.x + this.width / 2 - fromX) || 1;
    this.body.velocity.x = dir * PLAYER.KNOCKBACK_X;
    this.body.velocity.y = PLAYER.KNOCKBACK_Y;

    this.game.fx.burst(this.x + this.width / 2, this.y + this.height / 2, 14, {
      speed: 90,
      speedVar: 180,
      lifeMs: 330,
      color: 0xff5060,
      gravity: 200,
    });

    if (this.hp <= 0) {
      this.hp = 0;
      this.game.onPlayerDeath();
    }
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}