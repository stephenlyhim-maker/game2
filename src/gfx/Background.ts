// ============================================================
// src/gfx/Background.ts
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/GameConfig';

export type BackgroundTheme = 'valley' | 'ruins';

export class Background {
  private sky!: Phaser.GameObjects.Image;
  private stars!: Phaser.GameObjects.TileSprite;
  private moon!: Phaser.GameObjects.Image;
  private far!: Phaser.GameObjects.TileSprite;
  private mid!: Phaser.GameObjects.TileSprite;
  private near!: Phaser.GameObjects.TileSprite;
  private theme: BackgroundTheme;

  constructor(scene: Phaser.Scene, theme: BackgroundTheme = 'valley') {
    this.theme = theme;
    this.build(scene);
  }

  private build(scene: Phaser.Scene): void {
    const isRuins = this.theme === 'ruins';

    this.sky = scene.add
      .image(0, 0, 'bg-sky')
      .setOrigin(0, 0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setScrollFactor(0)
      .setDepth(DEPTH.SKY);
    if (isRuins) this.sky.setTint(0x9a7ad0);

    this.stars = scene.add
      .tileSprite(0, 0, GAME_WIDTH, 200, 'bg-stars')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_STARS);
    if (isRuins) this.stars.setTint(0xc8a8ff).setAlpha(0.55);

    this.moon = scene.add
      .image(520, 70, 'bg-moon')
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_MOON);
    if (isRuins) this.moon.setTint(0xc8a0ff);

    this.far = scene.add
      .tileSprite(0, 110, GAME_WIDTH, 220, isRuins ? 'bg-ruins-far' : 'bg-mountains')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.BG_FAR);

    this.mid = scene.add
      .tileSprite(0, 152, GAME_WIDTH, 220, isRuins ? 'bg-ruins-mid' : 'bg-hills')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.BG_MID);

    this.near = scene.add
      .tileSprite(0, 172, GAME_WIDTH, 200, isRuins ? 'bg-ruins-near' : 'bg-trees')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.BG_NEAR);
  }

  update(camX: number, camY: number): void {
    this.stars.tilePositionX = camX * 0.05;
    this.stars.tilePositionY = camY * 0.05;
    this.moon.x = 520 - camX * 0.04;
    this.moon.y = 70 - camY * 0.05;
    this.far.tilePositionX = camX * 0.18;
    this.far.y = 110 - camY * 0.22;
    this.mid.tilePositionX = camX * 0.42;
    this.mid.y = 152 - camY * 0.34;
    this.near.tilePositionX = camX * 0.62;
    this.near.y = 172 - camY * 0.45;
  }

  destroy(): void {
    this.sky.destroy(); this.stars.destroy(); this.moon.destroy();
    this.far.destroy(); this.mid.destroy(); this.near.destroy();
  }
}