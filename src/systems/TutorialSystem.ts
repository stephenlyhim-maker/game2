// ============================================================
// src/systems/TutorialSystem.ts
// Non-blocking tutorials: player can move while steps are shown.
// ============================================================

import { EventBus, EV } from '../core/EventBus';

export interface TutorialContext {
  moved: boolean;
  jumped: boolean;
  dashed: boolean;
  specialUsed: boolean;
  interacted: boolean;
  kills: number;
  openedBackpack: boolean;
}

export interface TutorialStepDef {
  id: string;
  text: string;
  isComplete: (ctx: TutorialContext) => boolean;
}

const DEFAULT_CTX: TutorialContext = {
  moved: false, jumped: false, dashed: false, specialUsed: false,
  interacted: false, kills: 0, openedBackpack: false,
};

export class TutorialSystem {
  private active = false;
  private steps: TutorialStepDef[] = [];
  private index = 0;
  private ctx: TutorialContext = { ...DEFAULT_CTX };

  get isActive(): boolean { return this.active; }

  start(steps: TutorialStepDef[]): void {
    if (steps.length === 0) return;
    this.active = true;
    this.steps = steps;
    this.index = 0;
    this.ctx = { ...DEFAULT_CTX };
    EventBus.emit(EV.TUTORIAL_START);
    this.emitStep();
  }

  /** Called each frame by GameScene with the current input state. */
  update(state: Partial<TutorialContext>): void {
    if (!this.active) return;

    Object.assign(this.ctx, state);

    // Advance through any completed steps in a single frame.
    while (this.active) {
      const step = this.steps[this.index];
      if (!step || !step.isComplete(this.ctx)) break;
      this.index++;
      if (this.index >= this.steps.length) {
        this.finish();
        return;
      }
      this.emitStep();
    }
  }

  onKill(): void {
    if (this.active) this.ctx.kills++;
  }

  private emitStep(): void {
    const step = this.steps[this.index];
    EventBus.emit(EV.TUTORIAL_STEP, {
      stepId: step.id,
      text: step.text,
      stepNumber: this.index + 1,
      totalSteps: this.steps.length,
    });
  }

  private finish(): void {
    this.active = false;
    this.steps = [];
    this.index = 0;
    EventBus.emit(EV.TUTORIAL_END);
  }
}