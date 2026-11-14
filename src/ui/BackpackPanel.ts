// ============================================================
// src/ui/BackpackPanel.ts
// Rebuilds on each open from Progression.inventory.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { Progression } from '../systems/Progression';

export class BackpackPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private visible = false;

  constructor(scene: Phaser.Scene) { this.scene = scene; }

  toggle(scene: Phaser.Scene): void {
    this.visible = !this.visible;
    if (this.visible) this.build(scene);
    else this.destroy();
  }

  get isOpen(): boolean { return this.visible; }

  private destroy(): void {
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }

  private build(scene: Phaser.Scene): void {
    this.destroy();

    const w = 300, h = 260;
    const x = (GAME_WIDTH - w) / 2;
    const y = (GAME_HEIGHT - h) / 2;
    const children: Phaser.GameObjects.GameObject[] = [];

    children.push(scene.add
      .rectangle(x, y, w, h, 0x0a0616, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xa080e0, 1));

    children.push(scene.add.text(x + 14, y + 12, "TRAVELER'S BACKPACK", {
      fontFamily: 'monospace', fontSize: '12px', fontStyle: 'bold', color: '#ffe8a0',
    }));

    // Divider
    children.push(scene.add.rectangle(x + 14, y + 34, w - 28, 1, 0x4a3a68, 1).setOrigin(0, 0));

    let rowY = y + 46;
    if (Progression.inventory.length === 0) {
      children.push(scene.add.text(x + 14, rowY, '(empty)', {
        fontFamily: 'monospace', fontSize: '10px', color: '#8a7a9a',
      }));
    } else {
      for (const item of Progression.inventory) {
        if (rowY > y + h - 40) break;
        children.push(scene.add.text(x + 14, rowY, `· ${item.name}`, {
          fontFamily: 'monospace', fontSize: '11px', color: '#e8e0f8',
        }));
        if (item.qty > 1) {
          children.push(scene.add
            .text(x + w - 14, rowY, `x${item.qty}`, {
              fontFamily: 'monospace', fontSize: '10px', color: '#a898c8',
            })
            .setOrigin(1, 0));
        }
        rowY += 20;
      }
    }

    children.push(scene.add.text(x + 14, y + h - 20, 'Press I to close', {
      fontFamily: 'monospace', fontSize: '9px', color: '#a898c8',
    }));

    this.container = scene.add
      .container(0, 0, children)
      .setDepth(300)
      .setScrollFactor(0);
  }
}