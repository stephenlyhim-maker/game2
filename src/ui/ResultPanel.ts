// ============================================================
// src/ui/ResultPanel.ts
// Win / death overlay.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/GameConfig';
import type { RunEndedPayload } from '../core/EventBus';

export class ResultPanel {
  private container: Phaser.GameObjects.Container;
  private title: Phaser.GameObjects.Text;
  private subtitle: Phaser.GameObjects.Text;
  private stats: Phaser.GameObjects.Text;
  private prompt: Phaser.GameObjects.Text;
  private pulse = 0;

  constructor(scene: Phaser.Scene) {
    const bg = scene.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x06040e, 0.86)
      .setOrigin(0, 0);

    this.title = scene.add
      .text(GAME_WIDTH / 2, 100, 'STAGE CLEAR', {
        fontFamily: 'monospace',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#8affc0',
      })
      .setOrigin(0.5);

    this.subtitle = scene.add
      .text(GAME_WIDTH / 2, 130, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#a0d8ff',
      })
      .setOrigin(0.5);

    this.stats = scene.add
      .text(GAME_WIDTH / 2, 190, '', {
        fontFamily: 'monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.prompt = scene.add
      .text(GAME_WIDTH / 2, 312, 'PRESS   R   TO   PLAY   AGAIN', {
        fontFamily: 'monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.container = scene.add
      .container(0, 0, [bg, this.title, this.subtitle, this.stats, this.prompt])
      .setDepth(1000)
      .setVisible(false);
  }

  show(payload: RunEndedPayload): void {
    const win = payload.win;

    this.title.setText(win ? 'STAGE CLEAR' : 'YOU DIED');
    this.title.setColor(win ? '#8affc0' : '#ff6070');

    this.subtitle.setText(
      win
        ? 'The portal closes behind you. Another world, another road.'
        : 'The valley claims another traveller...',
    );
    this.subtitle.setColor(win ? '#a0d8ff' : '#c090a0');

    this.stats.setText(
      [
        `TIME      ${this.fmtTime(payload.timeSec)}`,
        `SLAIN     ${payload.kills}`,
        `XP        ${payload.xp}`,
        `RANK      ${payload.rank}`,
      ].join('\n'),
    );

    this.prompt.setText(win ? 'PRESS   R   TO   PLAY   AGAIN' : 'PRESS   R   TO   RETRY');
    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.container.scene.tweens.add({ targets: this.container, alpha: 1, duration: 350 });
  
    const customMsg = payload.message;
    this.subtitle.setText(
      customMsg ? customMsg
      : payload.win ? 'The path forward opens.' : 'The void claims another traveller...',
    );
  }

  hide(): void {
    this.container.setVisible(false);
  }

  update(deltaMs: number): void {
    if (!this.container.visible) return;
    this.pulse = Math.floor((this.pulse + deltaMs / 130) % 2);
    this.prompt.setAlpha(this.pulse ? 1 : 0.45);
  }

  private fmtTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}