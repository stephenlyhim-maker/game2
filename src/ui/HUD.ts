// ============================================================
// src/ui/HUD.ts
// In-game HUD: HP / SP bars, XP, kills, hint line.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import type { PlayerStatsPayload, HintPayload } from '../core/EventBus';

export class HUD {
  private hpBar: Phaser.GameObjects.Graphics;
  private spBar: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;
  private xpText: Phaser.GameObjects.Text;
  private killText: Phaser.GameObjects.Text;
  private kPrompt: Phaser.GameObjects.Text;
  private hintBox: Phaser.GameObjects.Rectangle;
  private hintText: Phaser.GameObjects.Text;
  private hintTimer = 0;
  private pulse = 0;

  constructor(private scene: Phaser.Scene) {
    const depth = 100;

    scene.add
      .rectangle(10, 10, 220, 46, 0x080610, 0.74)
      .setOrigin(0, 0)
      .setDepth(depth)
      .setStrokeStyle(1, 0x9682d2, 0.55);

    scene.add
      .rectangle(GAME_WIDTH - 152, 10, 142, 46, 0x080610, 0.74)
      .setOrigin(0, 0)
      .setDepth(depth)
      .setStrokeStyle(1, 0x9682d2, 0.55);

    this.hpBar = scene.add.graphics().setDepth(depth + 1);
    this.spBar = scene.add.graphics().setDepth(depth + 1);

    const label = (x: number, y: number, text: string, color: string): Phaser.GameObjects.Text =>
      scene.add
        .text(x, y, text, { fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color })
        .setDepth(depth + 2);

    label(18, 18, 'HP', '#ffb0b0');
    label(18, 38, 'SP', '#b0c8ff');

    this.hpText = scene.add
      .text(176, 18, '100/100', { fontFamily: 'monospace', fontSize: '9px', fontStyle: 'bold', color: '#ffffff' })
      .setOrigin(1, 0)
      .setDepth(depth + 2);

    this.xpText = scene.add
      .text(GAME_WIDTH - 20, 18, 'XP  0', { fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: '#ffd870' })
      .setOrigin(1, 0)
      .setDepth(depth + 2);

    this.killText = scene.add
      .text(GAME_WIDTH - 20, 35, 'KILLS  0', { fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: '#ff9070' })
      .setOrigin(1, 0)
      .setDepth(depth + 2);

    this.kPrompt = scene.add
      .text(224, 38, 'K', { fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: '#ffffff' })
      .setDepth(depth + 2)
      .setVisible(false);

    this.hintBox = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 32, 380, 24, 0x080610, 0.75)
      .setDepth(depth)
      .setVisible(false);

    this.hintText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 32, '', {
        fontFamily: 'monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#c8c0e8',
      })
      .setOrigin(0.5)
      .setDepth(depth + 1)
      .setVisible(false);

    this.update({ hp: 100, maxHp: 100, special: 0, specialReady: false, xp: 0, kills: 0 });
  }

  update(stats: PlayerStatsPayload): void {
    this.drawBar(this.hpBar, 44, 18, 176, 12, stats.hp / stats.maxHp, this.hpColor(stats.hp / stats.maxHp));
    this.hpText.setText(`${Math.ceil(stats.hp)}/${stats.maxHp}`);

    const spReady = stats.specialReady;
    this.drawBar(
      this.spBar,
      44,
      38,
      176,
      12,
      stats.special / 100,
      spReady ? (this.pulse % 2 ? 0xd0a0ff : 0x8a5aff) : 0x3a5a9a,
    );

    this.kPrompt.setVisible(spReady);
    this.kPrompt.setColor(this.pulse % 2 ? '#ffffff' : '#d0a0ff');

    this.xpText.setText(`XP  ${stats.xp}`);
    this.killText.setText(`KILLS  ${stats.kills}`);
  }

  private hpColor(ratio: number): number {
    if (ratio > 0.5) return 0x48d858;
    if (ratio > 0.25) return 0xe8c040;
    return 0xe84040;
  }

  private drawBar(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    ratio: number,
    color: number,
  ): void {
    const r = Phaser.Math.Clamp(ratio, 0, 1);
    g.clear();
    g.fillStyle(0x241020, 1);
    g.fillRect(x, y, w, h);
    g.fillStyle(color, 1);
    g.fillRect(x + 1, y + 1, Math.round((w - 2) * r), h - 2);
    g.fillStyle(0xffffff, 0.28);
    g.fillRect(x + 1, y + 1, Math.round((w - 2) * r), 3);
  }

  showHint(payload: HintPayload): void {
    this.hintText.setText(payload.text);
    this.hintTimer = payload.durationMs;
    this.hintBox.setVisible(true);
    this.hintText.setVisible(true);
  }

  updateTimers(deltaMs: number): void {
    this.pulse = Math.floor((this.pulse + deltaMs / 130) % 2);

    if (this.hintTimer > 0) {
      this.hintTimer -= deltaMs;
      const a = Math.min(1, this.hintTimer / 900);
      this.hintText.setAlpha(a);
      this.hintBox.setAlpha(a * 0.75);
      if (this.hintTimer <= 0) {
        this.hintBox.setVisible(false);
        this.hintText.setVisible(false);
      }
    }
  }

  hideHint(): void {
    this.hintTimer = 0;
    this.hintBox.setVisible(false);
    this.hintText.setVisible(false);
  }
}