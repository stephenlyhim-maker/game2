// ============================================================
// src/ui/ExchangePanel.ts
// Right-side exchange UI. Empty placeholder for now.
// Closing emits EXCHANGE_END so GameScene can finish the quest.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { EventBus, EV } from '../core/EventBus';

export class ExchangePanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private visible = false;

  constructor(scene: Phaser.Scene) { this.scene = scene; }

  open(): void {
    if (this.visible) return;
    this.visible = true;
    this.build();
  }

  close(): void {
    if (!this.visible) return;
    this.destroy();
    this.visible = false;
    EventBus.emit(EV.EXCHANGE_END);
  }

  get isOpen(): boolean { return this.visible; }

  private destroy(): void {
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }

  private build(): void {
    this.destroy();

    const w = 220;
    const h = 300;
    const x = GAME_WIDTH - w - 10;
    const y = (GAME_HEIGHT - h) / 2;

    const children: Phaser.GameObjects.GameObject[] = [];

    const bg = this.scene.add
      .rectangle(x, y, w, h, 0x0a0616, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xa080e0, 1);
    children.push(bg);

    children.push(this.scene.add.text(x + 14, y + 12, 'EXCHANGE', {
      fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: '#ffe8a0',
    }));

    children.push(this.scene.add.text(x + 14, y + 34, '— with the blacksmith —', {
      fontFamily: 'monospace', fontSize: '9px', color: '#a898c8',
    }));

    children.push(this.scene.add.text(x + 14, y + 70,
      'Items & prices coming soon.\n\nThe smith is still sizing up\nyour Stalker parts.', {
        fontFamily: 'monospace', fontSize: '10px', color: '#c8c0e0',
        lineSpacing: 4,
      }));

    // Close button
    const closeBtn = this.scene.add
      .rectangle(x + w / 2, y + h - 30, w - 28, 26, 0x2a1a48, 1)
      .setStrokeStyle(1, 0xc8a0ff, 0.9)
      .setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x4a2a78, 1));
    closeBtn.on('pointerout',  () => closeBtn.setFillStyle(0x2a1a48, 1));
    closeBtn.on('pointerdown', () => this.close());
    children.push(closeBtn);

    children.push(this.scene.add.text(x + w / 2, y + h - 30, 'Close', {
      fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold', color: '#f0e8ff',
    }).setOrigin(0.5));

    children.push(this.scene.add.text(x + 14, y + h - 52, 'ESC / click Close', {
      fontFamily: 'monospace', fontSize: '8px', color: '#6a6080',
    }));

    this.container = this.scene.add
      .container(0, 0, children).setDepth(400).setScrollFactor(0);

    // ESC closes
    this.scene.input.keyboard?.once('keydown-ESC', () => this.close());
  }
}