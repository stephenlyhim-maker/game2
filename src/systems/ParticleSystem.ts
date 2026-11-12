// ============================================================
// src/systems/ParticleSystem.ts
// Lightweight pooled particles (no Phaser particle emitter
// dependency, so it behaves identically across versions).
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';

interface Particle {
  img: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  gravity: number;
  lifeMs: number;
  maxLifeMs: number;
}

export interface ParticleOptions {
  vx?: number;
  vy?: number;
  lifeMs?: number;
  gravity?: number;
  color?: number;
  size?: number;
}

export class ParticleSystem {
  private active: Particle[] = [];
  private pool: Phaser.GameObjects.Image[] = [];

  constructor(private scene: Phaser.Scene, private textureKey = 'pixel', private maxParticles = 600) {}

  emit(x: number, y: number, opts: ParticleOptions = {}): void {
    if (this.active.length >= this.maxParticles) return;

    let img = this.pool.pop();
    if (!img) {
      img = this.scene.add.image(0, 0, this.textureKey).setDepth(DEPTH.PARTICLE);
    }

    const size = opts.size ?? 2;
    img
      .setActive(true)
      .setVisible(true)
      .setPosition(x, y)
      .setDisplaySize(size, size)
      .setAlpha(1)
      .setTint(opts.color ?? 0xffffff)
      .setDepth(DEPTH.PARTICLE);

    this.active.push({
      img,
      vx: opts.vx ?? 0,
      vy: opts.vy ?? 0,
      gravity: opts.gravity ?? 0,
      lifeMs: opts.lifeMs ?? 240,
      maxLifeMs: opts.lifeMs ?? 240,
    });
  }

  burst(x: number, y: number, count: number, opts: ParticleOptions & { speed?: number; speedVar?: number } = {}): void {
    const speed = opts.speed ?? 180;
    const speedVar = opts.speedVar ?? 120;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed + Math.random() * speedVar;
      this.emit(x, y, {
        ...opts,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
      });
    }
  }

  hitSpark(x: number, y: number): void {
    this.burst(x, y, 10, { speed: 60, speedVar: 180, lifeMs: 230, color: 0xffd070, gravity: 200 });
    this.burst(x, y, 4, { speed: 40, speedVar: 120, lifeMs: 160, color: 0xffffff });
  }

  death(x: number, y: number, colorHex: string): void {
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    this.burst(x, y, 16, { speed: 60, speedVar: 200, lifeMs: 430, color, gravity: 430 });
    this.burst(x, y, 6, { speed: 60, speedVar: 180, lifeMs: 380, color: 0xffffff, gravity: 400, size: 3 });
  }

  dust(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      this.emit(x + (Math.random() - 0.5) * 10, y, {
        vx: (Math.random() - 0.5) * 96,
        vy: -Math.random() * 72,
        lifeMs: 260,
        color: 0xb0a090,
        gravity: 180,
      });
    }
  }

  update(dtMs: number): void {
    const dt = dtMs / 1000;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.lifeMs -= dtMs;
      if (p.lifeMs <= 0) {
        p.img.setActive(false).setVisible(false);
        this.pool.push(p.img);
        this.active.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.img.x += p.vx * dt;
      p.img.y += p.vy * dt;
      p.img.setAlpha(p.lifeMs / p.maxLifeMs);
    }
  }

  destroy(): void {
    this.active.forEach((p) => p.img.destroy());
    this.pool.forEach((img) => img.destroy());
    this.active = [];
    this.pool = [];
  }
}