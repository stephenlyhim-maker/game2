// ============================================================
// src/scenes/DialogueScene.ts
// Renders on top of the game. Pauses GameScene via events.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../config/GameConfig';
import { EventBus, EV } from '../core/EventBus';

export interface DialogueChoice {
  label: string;
  onSelect?: () => void;
  next?: number; // index in the same lines array to jump to
}

export interface DialogueLine {
  speaker: string;
  text: string;
  color?: string;
  character?: string;
  cg?: string;
  choices?: DialogueChoice[];
  closeAfter?: boolean;   // advance closes instead of moving to next line
}

export interface DialoguePayload { lines: DialogueLine[]; }

// Layout constants
const BOX_X = 24;
const BOX_Y = 218;
const BOX_W = GAME_WIDTH - 48;
const BOX_H = 120;
const BOX_RADIUS = 10;
const LEFT_SILHOUETTE_X = 100;
const LEFT_SILHOUETTE_Y = 130;
const RIGHT_CHARACTER_X = GAME_WIDTH - 100;
const RIGHT_CHARACTER_Y = 130;

export class DialogueScene extends Phaser.Scene {
  private lines: DialogueLine[] = [];
  private index = 0;
  private charIndex = 0;
  private typing = false;
  private typeEvent?: Phaser.Time.TimerEvent;

  private silhouette?: Phaser.GameObjects.Image;
  private character?: Phaser.GameObjects.Image;
  private cgImage?: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private bodyText!: Phaser.GameObjects.Text;
  private choiceContainer?: Phaser.GameObjects.Container;
  private dimRect!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENES.DIALOGUE, active: false });
  }

  create(data: DialoguePayload): void {
    this.lines = data.lines ?? [];
    this.index = 0;

    const hasArt = this.lines.some(l => l.character || l.cg);

    // 1. Dim overlay
    this.dimRect = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, hasArt ? 0.35 : 0.08)
      .setOrigin(0, 0);

    // 2. Optional fullscreen CG (behind characters)
    const firstCg = this.lines[0]?.cg;
    if (firstCg && this.textures.exists(firstCg)) {
      this.cgImage = this.add
        .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, firstCg)
        .setOrigin(0.5).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    }

    // 3. Speaker box — draw FIRST so text renders above it
    const boxGfx = this.add.graphics();
    boxGfx.fillStyle(0x080610, 0.95);
    boxGfx.fillRoundedRect(BOX_X, BOX_Y, BOX_W, BOX_H, BOX_RADIUS);
    boxGfx.lineStyle(2, 0xa88ae0, 1);
    boxGfx.strokeRoundedRect(BOX_X, BOX_Y, BOX_W, BOX_H, BOX_RADIUS);

    // 4. Speaker name
    this.nameText = this.add.text(BOX_X + 20, BOX_Y + 12, '', {
      fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold',
      color: '#ffe8a0',
    }).setShadow(1, 1, '#000000', 2);

    // 5. Body text
    this.bodyText = this.add.text(BOX_X + 20, BOX_Y + 36, '', {
      fontFamily: 'monospace', fontSize: '11px',
      color: '#f8f0ff',
      wordWrap: { width: BOX_W - 40 },
      lineSpacing: 4,
    }).setShadow(1, 1, '#000000', 1);

    // 6. Input handlers (skip when choices showing)
    this.input.on('pointerdown', (_p: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0) return;
      if (this.choiceContainer) return;
      this.advance();
    });
    const kb = this.input.keyboard;
    kb?.on('keydown-SPACE', () => { if (!this.choiceContainer) this.advance(); });
    kb?.on('keydown-ENTER', () => { if (!this.choiceContainer) this.advance(); });
    kb?.on('keydown-E',     () => { if (!this.choiceContainer) this.advance(); });

    EventBus.emit(EV.DIALOGUE_START);
    this.showLine(0);
  }

  private showLine(index: number): void {
    const line = this.lines[index];
    if (!line) { this.close(); return; }

    this.nameText.setText(line.speaker);
    this.nameText.setColor(line.color ?? '#ffe8a0');

    // Fullscreen CG
    if (line.cg && this.textures.exists(line.cg)) {
      if (this.cgImage) this.cgImage.setTexture(line.cg);
      else this.cgImage = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, line.cg)
        .setOrigin(0.5).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    } else if (this.cgImage) {
      this.cgImage.destroy();
      this.cgImage = undefined;
    }

    // Left silhouette + right character portrait
    this.silhouette?.destroy(); this.silhouette = undefined;
    this.character?.destroy();  this.character = undefined;

    if (line.character && this.textures.exists(line.character)) {
      if (this.textures.exists('cg-player-silhouette')) {
        this.silhouette = this.add
          .image(LEFT_SILHOUETTE_X, LEFT_SILHOUETTE_Y, 'cg-player-silhouette')
          .setOrigin(0.5);
      }
      this.character = this.add
        .image(RIGHT_CHARACTER_X, RIGHT_CHARACTER_Y, line.character)
        .setOrigin(0.5);
    }

    // Typewriter body text
    this.bodyText.setText('');
    this.charIndex = 0;
    this.typing = true;

    this.typeEvent?.remove();
    this.typeEvent = this.time.addEvent({
      delay: 22, loop: true,
      callback: () => {
        this.charIndex++;
        this.bodyText.setText(line.text.slice(0, this.charIndex));
        if (this.charIndex >= line.text.length) {
          this.typing = false;
          this.typeEvent?.remove();
        }
      },
    });

    // Choices (only after typing completes)
    this.choiceContainer?.destroy();
    this.choiceContainer = undefined;
    if (line.choices && line.choices.length > 0) {
      // show choices after text finishes
      const tryShow = () => {
        if (this.typing) { this.time.delayedCall(60, tryShow); return; }
        this.showChoices(line.choices!);
      };
      tryShow();
    }
  }

  private showChoices(choices: DialogueChoice[]): void {
    if (this.choiceContainer) return;

    const w = 260;
    const h = 28;
    const gap = 6;
    const totalH = choices.length * h + (choices.length - 1) * gap;
    const startY = BOX_Y - totalH - 12;
    const x = GAME_WIDTH / 2 - w / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0616, 0.96);
    bg.fillRoundedRect(x - 10, startY - 10, w + 20, totalH + 20, 8);
    bg.lineStyle(2, 0xa88ae0, 1);
    bg.strokeRoundedRect(x - 10, startY - 10, w + 20, totalH + 20, 8);

    const items: Phaser.GameObjects.GameObject[] = [bg];

    choices.forEach((choice, i) => {
      const cy = startY + i * (h + gap);
      const btnBg = this.add.rectangle(x, cy, w, h, 0x2a1a48, 1)
        .setOrigin(0, 0).setStrokeStyle(1, 0x8a6ad0, 0.9)
        .setInteractive({ useHandCursor: true });
      const label = this.add.text(x + 10, cy + h / 2, choice.label, {
        fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold',
        color: '#f0e8ff',
      }).setOrigin(0, 0.5);

      btnBg.on('pointerover', () => btnBg.setFillStyle(0x4a2a78, 1));
      btnBg.on('pointerout',  () => btnBg.setFillStyle(0x2a1a48, 1));
      btnBg.on('pointerdown', () => this.selectChoice(choice));

      items.push(btnBg, label);
    });

    this.choiceContainer = this.add.container(0, 0, items);
  }

  private selectChoice(choice: DialogueChoice): void {
    this.choiceContainer?.destroy();
    this.choiceContainer = undefined;
    choice.onSelect?.();

    if (choice.next === -1) { this.close(); return; }

    if (typeof choice.next === 'number') {
      this.index = choice.next;
      this.showLine(this.index);
    } else {
      this.index++;
      if (this.index >= this.lines.length) this.close();
      else this.showLine(this.index);
    }
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
    if (line?.closeAfter) { this.close(); return; }
    this.index++;
    if (this.index >= this.lines.length) this.close();
    else this.showLine(this.index);
  }

  private close(): void {
    this.typeEvent?.remove();
    this.choiceContainer?.destroy();
    EventBus.emit(EV.DIALOGUE_END);
    this.scene.stop();
  }
}