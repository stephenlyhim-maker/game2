// ============================================================
// src/ui/TutorialOverlay.ts
// Half-transparent panel at top-center. Player can move.
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/GameConfig';
import { EventBus, EV, type TutorialStepPayload } from '../core/EventBus';

export class TutorialOverlay {
  private container: Phaser.GameObjects.Container;
  private mainText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const cx = GAME_WIDTH / 2;
    const y = 34;
    const w = 420;
    const h = 58;
    const depth = 200;

    const bg = scene.add
      .rectangle(cx, y + h / 2, w, h, 0x0a0616, 0.72)
      .setStrokeStyle(1, 0xa080e0, 0.75);

    this.mainText = scene.add
      .text(cx, y + 14, '', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: w - 20 },
      })
      .setOrigin(0.5, 0);

    this.hintText = scene.add
      .text(cx, y + 38, '', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#c8b0ff',
      })
      .setOrigin(0.5, 0);

    this.container = scene.add
      .container(0, 0, [bg, this.mainText, this.hintText])
      .setDepth(depth)
      .setVisible(false);

    EventBus.on(EV.TUTORIAL_STEP, this.onStep, this);
    EventBus.on(EV.TUTORIAL_END, this.onEnd, this);
  }

  private onStep(payload: TutorialStepPayload): void {
    this.mainText.setText(payload.text);
    const hint = payload.hint ?? `Tutorial ${payload.stepNumber}/${payload.totalSteps}`;
    this.hintText.setText(hint);
    this.container.setVisible(true);
    this.container.setAlpha(1);
  }

  private onEnd(): void {
    this.container.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      onComplete: () => this.container.setVisible(false),
    });
  }
}