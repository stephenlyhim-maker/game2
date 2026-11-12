// ============================================================
// src/scenes/BootScene.ts
// Generates all placeholder art, then goes to the title.
// Real assets: add this.load.image/spritesheet calls in preload().
// ============================================================

import Phaser from 'phaser';
import { SCENES } from '../config/GameConfig';
import { TextureFactory } from '../gfx/TextureFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload(): void {
    // Example for future real assets:
    // this.load.setPath('assets');
    // this.load.image('player', 'sprites/player.png');
    // this.load.spritesheet('player-walk', 'sprites/player-walk.png', { frameWidth: 16, frameHeight: 20 });
    // this.load.image('cg-alice', 'cg/alice_intro.png');
  }

  create(): void {
    TextureFactory.generateAll(this);
    this.scene.start(SCENES.TITLE);
  }
}