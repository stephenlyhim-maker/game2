// ============================================================
// src/scenes/DialogueScene.ts
// Visual-novel style dialogue overlay.
// Supports full-screen CG images (non-pixel art) + portraits.
//
// Usage:
//   this.scene.launch('DialogueScene', {
//     lines: [{ speaker: 'Alice', text: 'Hello!', portrait: 'cg-alice', cg: 'cg-bg' }]
//   });
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../config/GameConfig';
import { EventBus, EV } from '../core/EventBus';

export interface DialogueLine {
  speaker: string;
  text: string;
  portrait?: string;
  cg?: string;
  color?: string;
}

export interface DialoguePayload {
  lines: DialogueLine[];
}

export class DialogueScene extends Phaser.Scene {
  private lines: DialogueLine[] = [];
  private index = 0;
  private charIndex = 0;
  private typing = false;
  private typeEvent?: Phaser.Time.TimerEvent;

  private cgImage?: Phaser.GameObjects.Image;
  private portrait?: Phaser.GameObjects.Image;
  private portraitFallback?: Phaser.GameObjects.Rectangle;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private box!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SCENES.DIALOGUE, active: false });
  }

  create(data: DialoguePayload): void {
    this.lines = data.lines ?? [];
    this.index = 0;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0, 0);

    if (this.lines[0]?.cg && this.textures.exists(this.lines[0].cg)) {
      this.cgImage = this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, this.lines[0].cg)
        .setOrigin(0.5)
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    }

    this.portraitFallback = this.add
      .rectangle(96, 200, 128, 128, 0x2a2440, 1)
      .setStrokeStyle(2, 0x8a6ad0)
      .setVisible(false);

    this.nameText = this.add.text(200, 226, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffd870',
    });

    this.bodyText = this.add.text(200, 248, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ffffff',
      wordWrap: { width: 380 },
      lineSpacing: 4,
    });

    const boxBg = this.add
      .rectangle(24, 210, 592, 128, 0x080610, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x8a6ad0, 0.9);

    this.box = this.add.container(0, 0, [boxBg, this.nameText, this.bodyText]);

    this.input.on('pointerdown', () => this.advance());
    this.input.keyboard?.on('keydown-SPACE', () => this.advance());
    this.input.keyboard?.on('keydown-ENTER', () => this.advance());

    EventBus.emit(EV.DIALOGUE_START);
    this.showLine(0);
  }

  private showLine(index: number): void {
    const line = this.lines[index];
    if (!line) {
      this.close();
      return;
    }

    this.nameText.setText(line.speaker);
    this.nameText.setColor(line.color ?? '#ffd870');

    if (this.cgImage && line.cg && this.textures.exists(line.cg)) {
      this.cgImage.setTexture(line.cg);
    }

    if (this.portrait) {
      this.portrait.destroy();
      this.portrait = undefined;
    }

    if (line.portrait && this.textures.exists(line.portrait)) {
      this.portraitFallback?.setVisible(false);
      this.portrait = this.add.image(96, 200, line.portrait).setOrigin(0.5);
    } else {
      this.portraitFallback?.setVisible(true);
    }

    this.bodyText.setText('');
    this.charIndex = 0;
    this.typing = true;

    this.typeEvent?.remove();
    this.typeEvent = this.time.addEvent({
      delay: 22,
      loop: true,
      callback: () => {
        this.charIndex++;
        this.bodyText.setText(line.text.slice(0, this.charIndex));
        if (this.charIndex >= line.text.length) {
          this.typing = false;
          this.typeEvent?.remove();
        }
      },
    });
  }

  private advance(): void {
    const line = this.lines[this.index];

    if (this.typing && line) {
      this.typeEvent?.remove();
      this.typing = false;
      this.charIndex = line.text.length;
      this.bodyText.setText(line.text);
      return;
    }

    this.index++;
    if (this.index >= this.lines.length) {
      this.close();
    } else {
      this.showLine(this.index);
    }
  }

  private close(): void {
    this.typeEvent?.remove();
    EventBus.emit(EV.DIALOGUE_END);
    this.scene.stop();
  }
}