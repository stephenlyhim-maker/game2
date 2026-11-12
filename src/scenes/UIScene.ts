// ============================================================
// src/scenes/UIScene.ts
// Runs on top of GameScene. Owns HUD + result overlay.
// ============================================================

import Phaser from 'phaser';
import { SCENES } from '../config/GameConfig';
import { EventBus, EV, type PlayerStatsPayload, type RunEndedPayload, type HintPayload } from '../core/EventBus';
import { HUD } from '../ui/HUD';
import { ResultPanel } from '../ui/ResultPanel';

export class UIScene extends Phaser.Scene {
  private hud!: HUD;
  private result!: ResultPanel;

  constructor() {
    super({ key: SCENES.UI, active: false });
  }

  create(): void {
    this.hud = new HUD(this);
    this.result = new ResultPanel(this);

    EventBus.on(EV.PLAYER_STATS, this.onStats, this);
    EventBus.on(EV.RUN_STARTED, this.onRunStarted, this);
    EventBus.on(EV.RUN_ENDED, this.onRunEnded, this);
    EventBus.on(EV.HINT, this.onHint, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(EV.PLAYER_STATS, this.onStats, this);
      EventBus.off(EV.RUN_STARTED, this.onRunStarted, this);
      EventBus.off(EV.RUN_ENDED, this.onRunEnded, this);
      EventBus.off(EV.HINT, this.onHint, this);
    });
  }

  override update(_time: number, delta: number): void {
    this.hud.updateTimers(delta);
    this.result.update(delta);
  }

  private onStats(payload: PlayerStatsPayload): void {
    this.hud.update(payload);
  }

  private onRunStarted(): void {
    this.result.hide();
  }

  private onRunEnded(payload: RunEndedPayload): void {
    this.hud.hideHint();
    this.result.show(payload);
  }

  private onHint(payload: HintPayload): void {
    this.hud.showHint(payload);
  }
}