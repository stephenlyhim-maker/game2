// ============================================================
// src/gfx/TextureFactory.ts
// All placeholder pixel art is generated at boot into textures.
// To use real art later: replace a `make(...)` call with
// `scene.load.image('player', 'assets/sprites/player.png')`
// in BootScene — nothing else needs to change.
// ============================================================

import Phaser from 'phaser';

type Ctx = CanvasRenderingContext2D;
type DrawFn = (c: Ctx, w: number, h: number) => void;

function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function make(scene: Phaser.Scene, key: string, w: number, h: number, draw: DrawFn): void {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(w));
  canvas.height = Math.max(1, Math.ceil(h));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  ctx.imageSmoothingEnabled = false;
  draw(ctx, canvas.width, canvas.height);
  scene.textures.addCanvas(key, canvas);
}

function pixelTriangle(c: Ctx, cx: number, baseY: number, halfW: number, height: number, color: string): void {
  c.fillStyle = color;
  for (let i = 0; i < height; i++) {
    const t = i / height;
    const w = Math.round(halfW * (1 - t));
    if (w <= 0) continue;
    c.fillRect(Math.round(cx - w), Math.round(baseY - i), w * 2, 1);
  }
}

function pixelDome(c: Ctx, cx: number, baseY: number, r: number, color: string): void {
  c.fillStyle = color;
  for (let i = 0; i < r; i++) {
    const dy = r - i;
    const halfW = Math.round(Math.sqrt(Math.max(0, r * r - dy * dy)));
    c.fillRect(Math.round(cx - halfW), Math.round(baseY - r + i), halfW * 2, 1);
  }
}

export const TextureFactory = {
  generateAll(scene: Phaser.Scene): void {
    this.pixel(scene);
    this.player(scene);
    this.slime(scene);
    this.voidStalker(scene);
    this.wisp(scene);
    this.projectile(scene);
    this.healthPickup(scene);
    this.portal(scene);
    this.portalReturn(scene);
    this.pickupItem(scene);
    this.pickupQuest(scene);
    this.backpack(scene);
    this.door(scene);
    this.moon(scene);
    this.ground(scene);
    this.platform(scene);
    this.sky(scene);
    this.stars(scene);
    this.mountains(scene);
    this.hills(scene);
    this.trees(scene);
    this.ruinsFar(scene);
    this.ruinsMid(scene);
    this.ruinsNear(scene);
    this.npcMiller(scene);
    this.npcGirl(scene);
    this.npcBlacksmith(scene);
    this.npcElder(scene);
    this.npcMerchant(scene);
    this.cgPlayerSilhouette(scene);
    this.cgLyra(scene);
    this.cgMerchant(scene);
  },

  pixel(scene: Phaser.Scene): void {
    make(scene, 'pixel', 2, 2, (c) => {
      c.fillStyle = '#ffffff';
      c.fillRect(0, 0, 2, 2);
    });
  },

  player(scene: Phaser.Scene): void {
    make(scene, 'player', 14, 20, (c) => {
      c.fillStyle = '#b03a4a'; c.fillRect(0, 7, 5, 9); c.fillRect(1, 16, 4, 2);
      c.fillStyle = '#2a3a5a'; c.fillRect(4, 14, 3, 4); c.fillRect(8, 14, 3, 4);
      c.fillStyle = '#3a2a1e'; c.fillRect(3, 17, 4, 3); c.fillRect(8, 17, 4, 3);
      c.fillStyle = '#3a7ec0'; c.fillRect(3, 8, 9, 7);
      c.fillStyle = '#e0b040'; c.fillRect(3, 13, 9, 2);
      c.fillStyle = '#2f6aa8'; c.fillRect(11, 9, 3, 5);
      c.fillStyle = '#f2c49a'; c.fillRect(5, 3, 8, 6);
      c.fillStyle = '#c0c8d8'; c.fillRect(3, 1, 10, 3); c.fillRect(3, 3, 3, 4); c.fillRect(11, 3, 2, 5);
      c.fillStyle = '#8a93a8'; c.fillRect(4, 1, 8, 1);
      c.fillStyle = '#1a1a2a'; c.fillRect(8, 5, 2, 2);
      c.fillStyle = '#e04040'; c.fillRect(5, 0, 4, 2);
      c.fillStyle = '#dfe8ff'; c.fillRect(10, 12, 3, 1);
      c.fillStyle = '#8a7a5a'; c.fillRect(9, 11, 2, 3);
    });
  },

  slime(scene: Phaser.Scene): void {
    make(scene, 'enemy-slime', 16, 14, (c) => {
      c.fillStyle = '#5ed46a';
      c.fillRect(2, 4, 12, 10);
      c.fillRect(1, 7, 14, 7);
      c.fillRect(4, 2, 8, 4);
      c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(4, 5, 4, 3);
      c.fillStyle = '#123a1a'; c.fillRect(5, 8, 2, 3); c.fillRect(9, 8, 2, 3);
    });
  },

  voidStalker(scene: Phaser.Scene): void {
    make(scene, 'enemy-void-stalker', 14, 22, (c) => {
      c.globalAlpha = 0.30; c.fillStyle = '#6a4a9a'; c.fillRect(0, 0, 14, 22); c.globalAlpha = 1;
      c.fillStyle = '#2a1a4a'; c.fillRect(2, 2, 10, 18);
      c.fillStyle = '#5a3a8a'; c.fillRect(3, 4, 8, 8); c.fillRect(4, 12, 6, 6);
      c.fillStyle = '#b090e0'; c.fillRect(4, 5, 6, 1); c.fillRect(4, 17, 6, 1);
      c.fillStyle = '#ffe0ff'; c.fillRect(4, 7, 2, 2); c.fillRect(8, 7, 2, 2);
      c.fillStyle = '#8a5ac0'; c.fillRect(11, 6, 2, 9); c.fillRect(10, 4, 3, 4);
      c.fillStyle = '#c0a0ff'; c.fillRect(0, 6, 2, 8); c.fillRect(12, 14, 2, 3);
    });
  },

  wisp(scene: Phaser.Scene): void {
    make(scene, 'enemy-wisp', 14, 14, (c) => {
      c.globalAlpha = 0.22; c.fillStyle = '#b080ff'; c.fillRect(0, 0, 14, 14); c.globalAlpha = 1;
      c.fillStyle = '#9a6ae0';
      c.fillRect(3, 1, 8, 2);
      c.fillRect(2, 3, 10, 8);
      c.fillRect(3, 11, 8, 2);
      c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect(5, 4, 4, 4);
      c.fillStyle = '#1a0a2a'; c.fillRect(4, 6, 2, 2); c.fillRect(8, 6, 2, 2);
    });
  },

  projectile(scene: Phaser.Scene): void {
    make(scene, 'projectile', 10, 10, (c) => {
      c.globalAlpha = 0.3; c.fillStyle = '#b070ff'; c.fillRect(0, 0, 10, 10); c.globalAlpha = 1;
      c.fillStyle = '#e0c0ff'; c.fillRect(2, 2, 6, 6);
      c.fillStyle = '#ffffff'; c.fillRect(4, 4, 2, 2);
    });
  },

  healthPickup(scene: Phaser.Scene): void {
    make(scene, 'pickup-health', 12, 12, (c) => {
      c.fillStyle = '#20202e'; c.fillRect(0, 0, 12, 12);
      c.fillStyle = '#f0f0f8'; c.fillRect(1, 1, 10, 10);
      c.fillStyle = '#e03850';
      c.fillRect(4, 2, 4, 8);
      c.fillRect(2, 4, 8, 4);
      c.fillStyle = '#ff90a0'; c.fillRect(4, 3, 2, 2);
    });
  },

  portal(scene: Phaser.Scene): void {
    make(scene, 'portal', 32, 64, (c, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      for (let i = -h / 2; i <= h / 2; i++) {
        const t = i / (h / 2);
        const halfW = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - t * t)));
        if (halfW <= 0) continue;
        const shade = i % 4 === 0 ? '#d8f4ff' : i % 2 === 0 ? '#8ae0ff' : '#5ab8e8';
        c.fillStyle = shade;
        c.fillRect(Math.round(cx - halfW), Math.round(cy + i), halfW * 2, 1);
      }
    });
  },

  moon(scene: Phaser.Scene): void {
    make(scene, 'bg-moon', 68, 68, (c) => {
      c.globalAlpha = 0.2; c.fillStyle = '#ffe0c0'; c.fillRect(0, 0, 68, 68); c.globalAlpha = 1;
      c.fillStyle = '#f4e2c8';
      c.fillRect(12, 12, 44, 44);
      c.fillRect(8, 20, 52, 28);
      c.fillRect(20, 8, 28, 52);
      c.fillStyle = '#e0c8a8';
      c.fillRect(22, 26, 8, 8);
      c.fillRect(38, 38, 10, 7);
    });
  },

  ground(scene: Phaser.Scene): void {
    make(scene, 'ground', 64, 120, (c, w, h) => {
      const rand = mulberry32(4242);
      c.fillStyle = '#0e0a16'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#2a2038'; c.fillRect(0, 0, w, 26);
      c.fillStyle = '#3a2f50'; c.fillRect(0, 0, w, 8);
      c.fillStyle = '#4a3f62'; c.fillRect(0, 6, w, 2);
      // cracks
      for (let i = 0; i < 8; i++) {
        const gx = Math.floor(rand() * w);
        const gy = 10 + Math.floor(rand() * 14);
        c.fillStyle = '#0a0614';
        c.fillRect(gx, gy, 3, 2);
      }
      for (let i = 0; i < 32; i++) {
        const dx = Math.floor(rand() * w);
        const dy = 28 + Math.floor(rand() * 90);
        c.fillStyle = 'rgba(255,255,255,0.04)';
        c.fillRect(dx, dy, 2, 2);
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fillRect(dx + 3, dy + 4, 2, 2);
      }
    });
  },

  platform(scene: Phaser.Scene): void {
    make(scene, 'platform', 64, 12, (c, w) => {
      const rand = mulberry32(777);
      c.fillStyle = '#0a0614'; c.fillRect(0, 2, w, 10);
      c.fillStyle = '#2a2044'; c.fillRect(0, 4, w, 8);
      c.fillStyle = '#3a2f58'; c.fillRect(0, 0, w, 6);
      c.fillStyle = '#5a4f78'; c.fillRect(0, 4, w, 2);
      c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(0, 0, w, 1);
      for (let i = 0; i < 6; i++) {
        c.fillStyle = 'rgba(0,0,0,0.4)';
        c.fillRect(Math.floor(rand() * (w - 3)), 6 + Math.floor(rand() * 3), 3, 2);
      }
    });
  },

  sky(scene: Phaser.Scene): void {
    make(scene, 'bg-sky', 8, 360, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0.0, '#0a0518');
      g.addColorStop(0.35, '#1e0f38');
      g.addColorStop(0.62, '#3a1e58');
      g.addColorStop(0.82, '#5e2f6e');
      g.addColorStop(1.0, '#3a1a4a');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    });
  },

  stars(scene: Phaser.Scene): void {
    make(scene, 'bg-stars', 512, 200, (c, w, h) => {
      const rand = mulberry32(99);
      for (let i = 0; i < 150; i++) {
        const x = Math.floor(rand() * w);
        const y = Math.floor(rand() * h * 0.85);
        const a = 0.25 + rand() * 0.6;
        c.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        c.fillRect(x, y, 2, 2);
      }
    });
  },

  mountains(scene: Phaser.Scene): void {
    make(scene, 'bg-mountains', 512, 220, (c, w, h) => {
      const rand = mulberry32(1337);
      for (let i = 0; i < 6; i++) {
        const cx = rand() * w;
        const halfW = 65 + rand() * 48;
        const height = 95 + rand() * 80;
        const dark = i % 2 === 0;
        const draw = (px: number): void => {
          pixelTriangle(c, px, h, halfW, height, dark ? '#281c40' : '#32234c');
          pixelTriangle(c, px, h, halfW * 0.6, height * 0.62, dark ? '#2f2249' : '#3a2a56');
        };
        draw(cx);
        if (cx - halfW < 0) draw(cx + w);
        if (cx + halfW > w) draw(cx - w);
      }
    });
  },

  hills(scene: Phaser.Scene): void {
    make(scene, 'bg-hills', 512, 220, (c, w, h) => {
      const rand = mulberry32(2024);
      for (let i = 0; i < 6; i++) {
        const cx = rand() * w;
        const r = 90 + rand() * 70;
        const draw = (px: number): void => {
          pixelDome(c, px, h, r, '#1e1734');
          pixelDome(c, px, h, r * 0.75, '#241c3d');
        };
        draw(cx);
        if (cx - r < 0) draw(cx + w);
        if (cx + r > w) draw(cx - w);
      }
    });
  },

  trees(scene: Phaser.Scene): void {
    make(scene, 'bg-trees', 512, 200, (c, w, h) => {
      const rand = mulberry32(555);
      for (let i = 0; i < 8; i++) {
        const cx = rand() * w;
        const th = 45 + rand() * 50;
        const draw = (px: number): void => {
          c.fillStyle = '#120e22';
          c.fillRect(Math.round(px - 3), Math.round(h - th), 6, th);
          pixelTriangle(c, px, h - th + 14, 26, 34, '#161128');
          pixelTriangle(c, px, h - th - 10, 20, 30, '#1a1430');
        };
        draw(cx);
        if (cx - 30 < 0) draw(cx + w);
        if (cx + 30 > w) draw(cx - w);
      }
    });
  },

  ruinsFar(scene: Phaser.Scene): void {
    make(scene, 'bg-ruins-far', 512, 220, (c, w, h) => {
      const rand = mulberry32(111);
      for (let i = 0; i < 7; i++) {
        const bx = rand() * w;
        const bw = 22 + rand() * 30;
        const bh = 60 + rand() * 90;
        c.fillStyle = i % 2 === 0 ? '#2a1a3a' : '#321f42';
        c.fillRect(Math.round(bx), Math.round(h - bh), Math.round(bw), Math.round(bh));
        c.fillStyle = '#1e1230';
        c.fillRect(Math.round(bx + bw * 0.3), Math.round(h - bh - 8), Math.round(bw * 0.4), 8);
      }
    });
  },

  ruinsMid(scene: Phaser.Scene): void {
    make(scene, 'bg-ruins-mid', 512, 220, (c, w, h) => {
      const rand = mulberry32(222);
      for (let i = 0; i < 5; i++) {
        const bx = rand() * w;
        const bw = 40 + rand() * 30;
        const bh = 50 + rand() * 60;
        c.fillStyle = '#1e1430';
        c.fillRect(Math.round(bx), Math.round(h - bh), Math.round(bw), Math.round(bh));
        c.fillStyle = '#0e0a20';
        c.fillRect(Math.round(bx + bw * 0.5), Math.round(h - bh - 4), 4, 4);
      }
    });
  },

  ruinsNear(scene: Phaser.Scene): void {
    make(scene, 'bg-ruins-near', 512, 200, (c, w, h) => {
      const rand = mulberry32(333);
      for (let i = 0; i < 8; i++) {
        const cx = rand() * w;
        const th = 40 + rand() * 50;
        c.fillStyle = '#0e0818';
        c.fillRect(Math.round(cx - 3), Math.round(h - th), 6, th);
        c.fillStyle = '#1a1030';
        c.fillRect(Math.round(cx - 12), Math.round(h - th - 12), 24, 14);
        c.fillStyle = '#3a2050';
        c.fillRect(Math.round(cx - 10), Math.round(h - th - 10), 2, 10);
      }
    });
  },

  pickupItem(scene: Phaser.Scene): void {
    make(scene, 'pickup-item', 14, 14, (c) => {
      c.globalAlpha = 0.4; c.fillStyle = '#ffd870'; c.fillRect(0, 0, 14, 14); c.globalAlpha = 1;
      c.fillStyle = '#a08040'; c.fillRect(3, 3, 8, 8);
      c.fillStyle = '#ffe8a0'; c.fillRect(4, 4, 6, 6);
      c.fillStyle = '#ffffff'; c.fillRect(6, 6, 2, 2);
    });
  },

  pickupQuest(scene: Phaser.Scene): void {
    make(scene, 'pickup-quest', 16, 16, (c) => {
      c.globalAlpha = 0.5; c.fillStyle = '#d0b0ff'; c.fillRect(0, 0, 16, 16); c.globalAlpha = 1;
      c.fillStyle = '#8a6ad0'; c.fillRect(3, 3, 10, 10);
      c.fillStyle = '#e8d8ff'; c.fillRect(4, 4, 8, 8);
      c.fillStyle = '#ffffff'; c.fillRect(7, 5, 2, 6); c.fillRect(5, 7, 6, 2);
    });
  },

  backpack(scene: Phaser.Scene): void {
    make(scene, 'backpack', 16, 16, (c) => {
      c.fillStyle = '#3a2a1a'; c.fillRect(2, 4, 12, 10);
      c.fillStyle = '#5a4230'; c.fillRect(3, 3, 10, 4); c.fillRect(3, 7, 10, 7);
      c.fillStyle = '#a08060'; c.fillRect(6, 2, 4, 3);
      c.fillStyle = '#ffd870'; c.fillRect(7, 9, 2, 2);
      c.fillStyle = '#2a1a0a'; c.fillRect(2, 13, 12, 2);
    });
  },

  npcMiller(scene: Phaser.Scene): void {
    make(scene, 'npc-miller', 14, 22, (c) => {
      c.fillStyle = '#6a5040'; c.fillRect(3, 8, 8, 10);
      c.fillStyle = '#8a7058'; c.fillRect(3, 10, 8, 8);
      c.fillStyle = '#d0a878'; c.fillRect(4, 4, 6, 6);
      c.fillStyle = '#a08870'; c.fillRect(3, 2, 8, 3);
      c.fillStyle = '#1a1a2a'; c.fillRect(5, 6, 1, 1); c.fillRect(8, 6, 1, 1);
      c.fillStyle = '#4a3828'; c.fillRect(3, 18, 3, 4); c.fillRect(8, 18, 3, 4);
      c.fillStyle = '#5a4030'; c.fillRect(10, 10, 3, 2);
    });
  },
  npcGirl(scene: Phaser.Scene): void {
    make(scene, 'npc-girl', 12, 20, (c) => {
      c.fillStyle = '#c08080'; c.fillRect(3, 8, 6, 8);
      c.fillStyle = '#e0b0c0'; c.fillRect(3, 10, 6, 6);
      c.fillStyle = '#f2c49a'; c.fillRect(3, 3, 6, 6);
      c.fillStyle = '#8a5a4a'; c.fillRect(2, 1, 8, 4);
      c.fillStyle = '#1a1a2a'; c.fillRect(5, 5, 1, 1); c.fillRect(7, 5, 1, 1);
      c.fillStyle = '#4a3018'; c.fillRect(3, 16, 2, 3); c.fillRect(7, 16, 2, 3);
      c.fillStyle = '#ffb0c0'; c.fillRect(5, 8, 2, 1);
    });
  },
  npcBlacksmith(scene: Phaser.Scene): void {
    make(scene, 'npc-blacksmith', 16, 22, (c) => {
      c.fillStyle = '#4a3020'; c.fillRect(2, 8, 12, 10);
      c.fillStyle = '#8a5040'; c.fillRect(3, 8, 10, 8);
      c.fillStyle = '#c88860'; c.fillRect(3, 3, 10, 7);
      c.fillStyle = '#2a1a10'; c.fillRect(3, 2, 10, 3);
      c.fillStyle = '#1a1a2a'; c.fillRect(5, 5, 2, 2); c.fillRect(9, 5, 2, 2);
      c.fillStyle = '#5a3010'; c.fillRect(3, 16, 4, 6); c.fillRect(9, 16, 4, 6);
      c.fillStyle = '#f0e0d0'; c.fillRect(12, 9, 3, 3);
    });
  },
  npcElder(scene: Phaser.Scene): void {
    make(scene, 'npc-elder', 14, 22, (c) => {
      c.fillStyle = '#8a6a9a'; c.fillRect(2, 8, 10, 10);
      c.fillStyle = '#a888b8'; c.fillRect(3, 10, 8, 8);
      c.fillStyle = '#e0c8b8'; c.fillRect(4, 4, 6, 6);
      c.fillStyle = '#c0c0d0'; c.fillRect(2, 2, 10, 4);
      c.fillStyle = '#1a1a2a'; c.fillRect(5, 6, 1, 1); c.fillRect(8, 6, 1, 1);
      c.fillStyle = '#5a4a30'; c.fillRect(3, 18, 3, 4); c.fillRect(8, 18, 3, 4);
      c.fillStyle = '#6a5a3a'; c.fillRect(11, 6, 2, 12);
    });
  },
  npcMerchant(scene: Phaser.Scene): void {
    make(scene, 'npc-merchant', 14, 22, (c) => {
      c.fillStyle = '#6a4a30'; c.fillRect(2, 8, 10, 10);
      c.fillStyle = '#a08050'; c.fillRect(3, 10, 8, 8);
      c.fillStyle = '#d8b890'; c.fillRect(4, 4, 6, 6);
      c.fillStyle = '#c0a040'; c.fillRect(2, 1, 10, 4);
      c.fillStyle = '#1a1a2a'; c.fillRect(5, 6, 1, 1); c.fillRect(8, 6, 1, 1);
      c.fillStyle = '#3a2010'; c.fillRect(3, 18, 3, 4); c.fillRect(8, 18, 3, 4);
      c.fillStyle = '#8a6a20'; c.fillRect(11, 8, 2, 3);
    });
  },
  cgPlayerSilhouette(scene: Phaser.Scene): void {
    make(scene, 'cg-player-silhouette', 50, 120, (c) => {
      c.globalAlpha = 0.6; c.fillStyle = '#1a1020'; c.fillRect(0, 0, 50, 120); c.globalAlpha = 1;
      c.fillStyle = '#0a0810';
      c.fillRect(18, 0, 14, 20);
      c.fillRect(14, 20, 22, 50);
      c.fillRect(8, 25, 6, 40);
      c.fillRect(36, 25, 6, 40);
      c.fillRect(16, 70, 8, 50);
      c.fillRect(26, 70, 8, 50);
      c.fillStyle = '#3a2a4a';
      c.fillRect(22, 30, 6, 3);
    });
  },
  cgLyra(scene: Phaser.Scene): void {
    make(scene, 'cg-lyra', 80, 140, (c) => {
      c.globalAlpha = 0.25; c.fillStyle = '#c0a0ff'; c.fillRect(0, 0, 80, 140); c.globalAlpha = 1;
      c.fillStyle = '#4a2a7a'; c.fillRect(30, 0, 20, 30);
      c.fillStyle = '#6a4a9a'; c.fillRect(22, 30, 36, 70);
      c.fillStyle = '#2a1a4a'; c.fillRect(26, 100, 10, 40); c.fillRect(44, 100, 10, 40);
      c.fillStyle = '#8a6ab0'; c.fillRect(20, 20, 4, 60); c.fillRect(56, 20, 4, 60);
      c.fillStyle = '#e0d0ff'; c.fillRect(33, 12, 4, 3); c.fillRect(43, 12, 4, 3);
      c.fillStyle = '#c0a0ff'; c.fillRect(36, 40, 8, 30);
    });
  },
  cgMerchant(scene: Phaser.Scene): void {
    make(scene, 'cg-merchant', 80, 140, (c) => {
      c.globalAlpha = 0.15; c.fillStyle = '#e0c070'; c.fillRect(0, 0, 80, 140); c.globalAlpha = 1;
      c.fillStyle = '#8a6a30'; c.fillRect(20, 30, 40, 80);
      c.fillStyle = '#d0b080'; c.fillRect(30, 8, 20, 26);
      c.fillStyle = '#3a2a10'; c.fillRect(24, 0, 32, 10);
      c.fillStyle = '#2a1a0a'; c.fillRect(34, 18, 3, 3); c.fillRect(43, 18, 3, 3);
      c.fillStyle = '#3a2a10'; c.fillRect(26, 110, 10, 30); c.fillRect(44, 110, 10, 30);
      c.fillStyle = '#ffd870'; c.fillRect(20, 60, 40, 3); c.fillRect(20, 100, 40, 2);
      c.fillStyle = '#a08040'; c.fillRect(18, 40, 4, 3);
    });
  },
  door(scene: Phaser.Scene): void {
    make(scene, 'door', 24, 60, (c) => {
      c.fillStyle = '#3a1a1a'; c.fillRect(2, 4, 20, 56);
      c.fillStyle = '#5a3a20'; c.fillRect(4, 6, 16, 54);
      c.fillStyle = '#7a5a30'; c.fillRect(6, 8, 12, 52);
      c.fillStyle = '#c0a040'; c.fillRect(15, 34, 3, 3);
    });
  },
  portalReturn(scene: Phaser.Scene): void {
    make(scene, 'portal-return', 32, 64, (c, w, h) => {
      const cx = w / 2; const cy = h / 2;
      for (let i = -h / 2; i <= h / 2; i++) {
        const t = i / (h / 2);
        const halfW = Math.round((w / 2) * Math.sqrt(Math.max(0, 1 - t * t)));
        if (halfW <= 0) continue;
        const shade = i % 4 === 0 ? '#d8ffd8' : i % 2 === 0 ? '#8affa0' : '#5ae87a';
        c.fillStyle = shade;
        c.fillRect(Math.round(cx - halfW), Math.round(cy + i), halfW * 2, 1);
      }
    });
  },
};