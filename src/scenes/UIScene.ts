// ============================================================
// src/scenes/UIScene.ts
// ============================================================

import Phaser from 'phaser';
import { SCENES } from '../config/GameConfig';
import {
  EventBus, EV,
  type PlayerStatsPayload, type RunEndedPayload, type HintPayload, type ToastPayload,
  type QuestStartedPayload, type QuestCompletedPayload,
} from '../core/EventBus';
import { HUD } from '../ui/HUD';
import { ResultPanel } from '../ui/ResultPanel';
import { QuestTracker } from '../ui/QuestTracker';
import { QuestPanel } from '../ui/QuestPanel';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { BackpackPanel } from '../ui/BackpackPanel';
import { ExchangePanel } from '../ui/ExchangePanel';

export class UIScene extends Phaser.Scene {
  private hud!: HUD;
  private result!: ResultPanel;
  private tracker!: QuestTracker;
  private tutorial!: TutorialOverlay;
  private backpack!: BackpackPanel;
  private questPanel!: QuestPanel;
  private keyI!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private exchangePanel!: ExchangePanel;

  constructor() { super({ key: SCENES.UI, active: false }); }

  create(): void {
    this.hud = new HUD(this);
    this.result = new ResultPanel(this);
    this.tracker = new QuestTracker(this);
    this.tutorial = new TutorialOverlay(this);
    this.backpack = new BackpackPanel(this);
    this.questPanel = new QuestPanel(this);
    this.exchangePanel = new ExchangePanel(this);

    this.keyI = this.input.keyboard!.addKey('I', true, true);
    this.keyQ = this.input.keyboard!.addKey('Q', true, true);

    EventBus.on(EV.PLAYER_STATS, this.onStats, this);
    EventBus.on(EV.RUN_STARTED, this.onRunStarted, this);
    EventBus.on(EV.RUN_ENDED, this.onRunEnded, this);
    EventBus.on(EV.HINT, this.onHint, this);
    EventBus.on(EV.TOAST, this.onToast, this);
    EventBus.on(EV.QUEST_STARTED, this.onQuestStarted, this);
    EventBus.on(EV.QUEST_COMPLETED, this.onQuestCompleted, this);
    EventBus.on(EV.EXCHANGE_START, () => this.exchangePanel.open(), this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(EV.PLAYER_STATS, this.onStats, this);
      EventBus.off(EV.RUN_STARTED, this.onRunStarted, this);
      EventBus.off(EV.RUN_ENDED, this.onRunEnded, this);
      EventBus.off(EV.HINT, this.onHint, this);
      EventBus.off(EV.TOAST, this.onToast, this);
      EventBus.off(EV.QUEST_STARTED, this.onQuestStarted, this);
      EventBus.off(EV.QUEST_COMPLETED, this.onQuestCompleted, this);
    });
  }

  override update(_time: number, delta: number): void {
    this.hud.updateTimers(delta);
    this.result.update(delta);
    this.tracker.update(delta);

    if (Phaser.Input.Keyboard.JustDown(this.keyI)) this.backpack.toggle(this);
    if (Phaser.Input.Keyboard.JustDown(this.keyQ)) this.questPanel.toggle();
  }

  private onStats(payload: PlayerStatsPayload): void { this.hud.update(payload); }
  private onRunStarted(): void { this.result.hide(); }
  private onRunEnded(payload: RunEndedPayload): void {
    this.hud.hideHint();
    this.result.show(payload);
  }
  private onHint(payload: HintPayload): void { this.hud.showHint(payload); }
  private onToast(payload: ToastPayload): void {
    this.hud.showHint({ text: payload.text, durationMs: 2600 });
  }

  private onQuestStarted(payload: QuestStartedPayload): void {
    this.hud.showHint({ text: `New Quest: ${payload.name}`, durationMs: 3000 });
  }

  private onQuestCompleted(payload: QuestCompletedPayload): void {
    const rewardLine = payload.rewards.map(r => `${r.name} x${r.qty}`).join(', ');
    const msg = rewardLine
      ? `Quest Complete: ${payload.name} — ${rewardLine}`
      : `Quest Complete: ${payload.name}`;
    this.hud.showHint({ text: msg, durationMs: 4200 });
  }
}