// ============================================================
// src/ui/QuestTracker.ts
// Shows the currently-tracked quest (top-left). Hidden if none.
// ============================================================

import Phaser from 'phaser';
import {
  EventBus, EV,
  type QuestUpdatedPayload, type QuestCompletedPayload, type QuestTrackedPayload,
} from '../core/EventBus';
import { QuestSystem } from '../systems/QuestSystem';

export class QuestTracker {
  private container: Phaser.GameObjects.Container;
  private nameText: Phaser.GameObjects.Text;
  private stepText: Phaser.GameObjects.Text;
  private progressText: Phaser.GameObjects.Text;
  private bg: Phaser.GameObjects.Rectangle;
  private questId: string | null = null;
  private hideTimer = 0;

  constructor(scene: Phaser.Scene) {
    const x = 10, y = 64, w = 240, h = 64, depth = 100;

    this.bg = scene.add
      .rectangle(x, y, w, h, 0x080610, 0.72)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0xc8a0ff, 0.6);

    this.nameText = scene.add.text(x + 10, y + 8, '', {
      fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold', color: '#ffe08a',
    });

    this.stepText = scene.add.text(x + 10, y + 28, '', {
      fontFamily: 'monospace', fontSize: '10px', color: '#e0d8f8',
      wordWrap: { width: w - 20 },
    });

    this.progressText = scene.add.text(x + w - 10, y + 8, '', {
      fontFamily: 'monospace', fontSize: '10px', fontStyle: 'bold', color: '#c0a8ff',
    }).setOrigin(1, 0);

    this.container = scene.add
      .container(0, 0, [this.bg, this.nameText, this.stepText, this.progressText])
      .setDepth(depth).setVisible(false).setScrollFactor(0);

    EventBus.on(EV.QUEST_TRACKED, this.onTracked, this);
    EventBus.on(EV.QUEST_UPDATED, this.onUpdated, this);
    EventBus.on(EV.QUEST_COMPLETED, this.onCompleted, this);

    // Catch any quest tracked before we were constructed.
    const tracked = QuestSystem.getTracked();
    if (tracked) {
      this.questId = tracked.def.id;
      this.renderTracked();
    }
  }

  private onTracked(payload: QuestTrackedPayload): void {
    if (!payload.questId) {
      // Don't interrupt an active completion message.
      if (this.hideTimer > 0) return;
      this.questId = null;
      this.container.setVisible(false);
      return;
    }
    // New tracking request — always accept, clears completion.
    this.hideTimer = 0;
    this.questId = payload.questId;
    this.renderTracked();
  }

  private renderTracked(): void {
    if (!this.questId) return;
    const tracked = QuestSystem.getTracked();
    if (!tracked) return;

    const state = tracked.state;
    const step = tracked.def.steps[state.stepIndex];
    if (!step) return;

    this.nameText.setText(tracked.def.name);
    this.nameText.setColor('#ffe08a');
    this.stepText.setText(`· ${step.instruction}`);

    const cur = state.progress[state.stepIndex];
    const target = step.count ?? 1;
    this.progressText.setText(target > 1 ? `${cur}/${target}` : '');

    this.container.setVisible(true);
    this.container.setAlpha(0);
    this.container.scene.tweens.add({
      targets: this.container, alpha: 1, duration: 250,
    });
  }

  private onUpdated(payload: QuestUpdatedPayload): void {
    if (payload.questId !== this.questId) return;
    this.stepText.setText(`· ${payload.stepInstruction}`);
    this.progressText.setText(
      payload.target > 1 ? `${payload.progress}/${payload.target}` : '',
    );
  }

  private onCompleted(payload: QuestCompletedPayload): void {
    if (payload.questId !== this.questId) return;
    this.nameText.setText(`${payload.name} — COMPLETE`);
    this.nameText.setColor('#8affc0');
    const rewardLine = payload.rewards.map(r => `${r.name} x${r.qty}`).join(', ');
    this.stepText.setText(rewardLine ? `Reward: ${rewardLine}` : 'Quest complete.');
    this.progressText.setText('');
    this.hideTimer = 6000;
  }

  update(dtMs: number): void {
    if (this.hideTimer <= 0) return;
    this.hideTimer -= dtMs;
    if (this.hideTimer <= 0) {
      this.container.scene.tweens.add({
        targets: this.container, alpha: 0, duration: 400,
        onComplete: () => this.container.setVisible(false),
      });
      this.questId = null;
    }
  }
}