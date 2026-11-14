// ============================================================
// src/ui/QuestPanel.ts
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import { QuestSystem } from '../systems/QuestSystem';

export class QuestPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container | null = null;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  toggle(): void {
    this.visible = !this.visible;
    if (this.visible) this.build();
    else this.destroy();
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

    const w = 440;
    const h = 340;
    const x = (GAME_WIDTH - w) / 2;
    const y = (GAME_HEIGHT - h) / 2;

    const children: Phaser.GameObjects.GameObject[] = [];

    const dim = this.scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: false })
      .on('pointerdown', () => this.toggle());
    children.push(dim);

    const panel = this.scene.add
      .rectangle(x, y, w, h, 0x0a0616, 0.97)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xa080e0, 1);
    children.push(panel);

    children.push(this.scene.add.text(x + 16, y + 12, 'QUESTS', {
      fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: '#ffe8a0',
    }));

    children.push(this.scene.add.text(x + 16, y + h - 20,
      'Click a quest to track · Q to close', {
        fontFamily: 'monospace', fontSize: '9px', color: '#a898c8',
      }));

    let rowY = y + 40;
    const rowH = 44;
    const rowGap = 6;
    const active = QuestSystem.getAllActive();
    const completed = QuestSystem.getCompleted();
    const trackedId = QuestSystem.getTrackedId();

    if (active.length === 0 && completed.length === 0) {
      children.push(this.scene.add.text(x + 16, rowY, 'No quests yet.', {
        fontFamily: 'monospace', fontSize: '11px', color: '#8a7a9a',
      }));
    }

    for (const { def, state } of active) {
      const tracked = def.id === trackedId;
      const step = def.steps[state.stepIndex];
      const name = `${tracked ? '▶ ' : ''}${def.name}`;
      const instr = step?.instruction ?? '';
      children.push(this.makeRow(x + 12, rowY, w - 24, rowH, name, instr, def.id, tracked, false));
      rowY += rowH + rowGap;
    }

    if (completed.length > 0 && rowY < y + h - 50) {
      children.push(this.scene.add.text(x + 16, rowY, '— Completed —', {
        fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: '#8affc0',
      }));
      rowY += 20;
      for (const def of completed) {
        if (rowY > y + h - 50) break;
        children.push(this.makeRow(x + 12, rowY, w - 24, rowH,
          `✓ ${def.name}`, 'Completed', def.id, false, true));
        rowY += rowH + rowGap;
      }
    }

    this.container = this.scene.add
      .container(0, 0, children).setDepth(400).setScrollFactor(0);
  }

  private makeRow(
    x: number, y: number, w: number, h: number,
    name: string, instruction: string, questId: string,
    tracked: boolean, disabled = false,
  ): Phaser.GameObjects.Container {
    const rowBg = this.scene.add
      .rectangle(x, y, w, h, tracked ? 0x2a1a48 : 0x1a1028, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, tracked ? 0xc8a0ff : 0x4a3a68, 0.8);

    const nameTxt = this.scene.add.text(x + 10, y + 5, name, {
      fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold',
      color: tracked ? '#ffe8a0' : (disabled ? '#8affc0' : '#e8e0f8'),
    });

    const instrTxt = this.scene.add.text(x + 10, y + 22, instruction, {
      fontFamily: 'monospace', fontSize: '9px', color: '#a898c8',
      wordWrap: { width: w - 20 },
    });

    const row = this.scene.add.container(0, 0, [rowBg, nameTxt, instrTxt]);

    if (!disabled) {
      rowBg.setInteractive({ useHandCursor: true });
      rowBg.on('pointerover', () => rowBg.setFillStyle(0x3a2a58, 1));
      rowBg.on('pointerout',  () => rowBg.setFillStyle(tracked ? 0x2a1a48 : 0x1a1028, 1));
      rowBg.on('pointerdown', () => {
        QuestSystem.setTracked(tracked ? null : questId);
        this.build();
      });
    }

    return row;
  }
}