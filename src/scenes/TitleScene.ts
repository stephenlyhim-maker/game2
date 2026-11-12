// ============================================================
// src/scenes/TitleScene.ts
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES, DEPTH } from '../config/GameConfig';
import { Background } from '../gfx/Background';
import { InputManager } from '../systems/InputManager';

const HELP_LINES = [
  'A / D   move          W   jump   ( double jump + hover at apex )',
  'J   DAGGER DASH  —  blink forward, invisible, hits everything on the path',
  'K   GRAND SWEEP  —  120° arc of steel. Charges when your dash lands hits.',
  '',
  'Reach the portal at the far end of the valley to clear the stage.',
  'You never have to kill a single thing... but the XP is nice.',
];

export class TitleScene extends Phaser.Scene {
  private background!: Background;
  private inputMgr!: InputManager;
  private prompt!: Phaser.GameObjects.Text;
  private time = 0;

  constructor() {
    super(SCENES.TITLE);
  }

  create(): void {
    this.time = 0;
    this.background = new Background(this);
    this.inputMgr = new InputManager(this);

    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x06040e, 0.78)
      .setOrigin(0, 0)
      .setDepth(DEPTH.FX);

    const depth = DEPTH.FX + 1;

    this.add
      .text(GAME_WIDTH / 2 + 2, 112, 'ISEKAI BLADE', {
        fontFamily: 'monospace',
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#8a5aff',
      })
      .setOrigin(0.5)
      .setAlpha(0.35)
      .setDepth(depth);

    this.add
      .text(GAME_WIDTH / 2, 110, 'ISEKAI BLADE', {
        fontFamily: 'monospace',
        fontSize: '34px',
        fontStyle: 'bold',
        color: '#e8d8ff',
      })
      .setOrigin(0.5)
      .setDepth(depth);

    this.add
      .text(GAME_WIDTH / 2, 134, '~  a pixel isekai adventure  ~', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#a890d0',
      })
      .setOrigin(0.5)
      .setDepth(depth);

    HELP_LINES.forEach((line, i) => {
      this.add
        .text(GAME_WIDTH / 2, 182 + i * 19, line, {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#d0c8e8',
        })
        .setOrigin(0.5)
        .setDepth(depth);
    });

    this.prompt = this.add
      .text(GAME_WIDTH / 2, 322, 'PRESS   ENTER   TO   BEGIN', {
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(depth);

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  update(_time: number, delta: number): void {
    this.time += delta;
    this.inputMgr.update();

    this.background.update(Math.sin(this.time * 0.00008) * 260 + 260, 0);
    this.prompt.setAlpha(Math.sin(this.time * 0.005) > 0 ? 1 : 0.45);

    if (this.inputMgr.justPressed('confirm')) {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start(SCENES.GAME);
      });
    }
  }
}