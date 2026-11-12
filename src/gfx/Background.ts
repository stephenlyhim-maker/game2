// ============================================================
// src/gfx/Background.ts
// Parallax sky / stars / moon / mountains / hills / trees.
// Swap themes by extending the THEMES map.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from '../config/GameConfig';

export class Background {
  private sky: Phaser.GameObjects.Image;
  private stars: Phaser.GameObjects.TileSprite;
  private moon: Phaser.GameObjects.Image;
  private mountains: Phaser.GameObjects.TileSprite;
  private hills: Phaser.GameObjects.TileSprite;
  private trees: Phaser.GameObjects.TileSprite;

  constructor(scene: Phaser.Scene) {
    this.sky = scene.add
      .image(0, 0, 'bg-sky')
      .setOrigin(0, 0)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setScrollFactor(0)
      .setDepth(DEPTH.SKY);

    this.stars = scene.add
      .tileSprite(0, 0, GAME_WIDTH, 200, 'bg-stars')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_STARS);

    this.moon = scene.add
      .image(520, 70, 'bg-moon')
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_MOON);

    this.mountains = scene.add
      .tileSprite(0, 110, GAME_WIDTH, 220, 'bg-mountains')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_FAR);

    this.hills = scene.add
      .tileSprite(0, 152, GAME_WIDTH, 220, 'bg-hills')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_MID);

    this.trees = scene.add
      .tileSprite(0, 172, GAME_WIDTH, 200, 'bg-trees')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.BG_NEAR);
  }

  update(camX: number, camY: number): void {
    this.stars.tilePositionX = camX * 0.05;
    this.stars.tilePositionY = camY * 0.05;

    this.moon.x = 520 - camX * 0.04;
    this.moon.y = 70 - camY * 0.05;

    this.mountains.tilePositionX = camX * 0.18;
    this.mountains.y = 110 - camY * 0.22;

    this.hills.tilePositionX = camX * 0.42;
    this.hills.y = 152 - camY * 0.34;

    this.trees.tilePositionX = camX * 0.62;
    this.trees.y = 172 - camY * 0.45;
  }

  destroy(): void {
    this.sky.destroy();
    this.stars.destroy();
    this.moon.destroy();
    this.mountains.destroy();
    this.hills.destroy();
    this.trees.destroy();
  }
}