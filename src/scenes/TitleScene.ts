// ============================================================
// src/scenes/TitleScene.ts
// "Resonance of the Void — Act 1"
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES, DEPTH } from '../config/GameConfig';
import { Background } from '../gfx/Background';
import { InputManager } from '../systems/InputManager';
import { Progression } from '../systems/Progression';

export class TitleScene extends Phaser.Scene {
  private background!: Background;
  private inputMgr!: InputManager;
  private prompt!: Phaser.GameObjects.Text;
  private t = 0;

  constructor() { super(SCENES.TITLE); }

  create(): void {
    this.t = 0;
    this.background = new Background(this, 'ruins');
    this.inputMgr = new InputManager(this);

    // heavy vignette + dim so title pops
    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x04020a, 0.72)
      .setOrigin(0, 0).setDepth(DEPTH.FX);

    const d = DEPTH.FX + 1;

    // resonance glow behind title
    const glow = this.add
      .text(GAME_WIDTH / 2, 96, 'RESONANCE OF THE VOID', {
        fontFamily: 'monospace', fontSize: '26px', fontStyle: 'bold',
        color: '#a070ff',
      })
      .setOrigin(0.5).setAlpha(0.35).setDepth(d);

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.2, to: 0.6 },
      scaleX: { from: 1.0, to: 1.04 },
      scaleY: { from: 1.0, to: 1.04 },
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.add
      .text(GAME_WIDTH / 2, 96, 'RESONANCE OF THE VOID', {
        fontFamily: 'monospace', fontSize: '24px', fontStyle: 'bold',
        color: '#e8d8ff',
      })
      .setOrigin(0.5).setDepth(d + 1);

    this.add
      .text(GAME_WIDTH / 2, 128, 'Act 1  —  The Awakening', {
        fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold',
        color: '#a898c8',
      })
      .setOrigin(0.5).setDepth(d + 1);

    this.add
      .text(GAME_WIDTH / 2, 168, 'A dying world. A voice in the void. You.', {
        fontFamily: 'monospace', fontSize: '11px', color: '#c8c0e0',
      })
      .setOrigin(0.5).setDepth(d + 1);

    this.add
      .text(GAME_WIDTH / 2, 196, '“The Tides hunger for what you are.”', {
        fontFamily: 'monospace', fontSize: '10px', fontStyle: 'italic',
        color: '#9a7ad0',
      })
      .setOrigin(0.5).setDepth(d + 1);

    this.prompt = this.add
      .text(GAME_WIDTH / 2, 288, 'PRESS   ENTER   TO   AWAKEN', {
        fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5).setDepth(d + 1);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 14, 'A / D move   ·   W jump   ·   J dash   ·   K sweep   ·   E interact   ·   I backpack', {
        fontFamily: 'monospace', fontSize: '9px', color: '#6a6080',
      })
      .setOrigin(0.5).setDepth(d + 1);

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.t += delta;
    this.inputMgr.update();

    this.background.update(Math.sin(this.t * 0.0001) * 300 + 300, 0);
    this.prompt.setAlpha(Math.sin(this.t * 0.006) > 0 ? 1 : 0.4);

    if (this.inputMgr.justPressed('confirm')) {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        Progression.reset();
        Progression.currentLevel = 'house';
        this.scene.start(SCENES.GAME);
      });
    }
  }
}