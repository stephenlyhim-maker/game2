// ============================================================
// src/systems/QuestSystem.ts
// ============================================================

import { EventBus, EV } from '../core/EventBus';
import { QUESTS, type QuestDef, type QuestStep } from '../data/quests';

export interface ActiveQuestState {
  id: string;
  stepIndex: number;
  progress: number[];
}

class QuestSystemImpl {
  private active = new Map<string, ActiveQuestState>();
  private completed = new Set<string>();
  private tracked: string | null = null;

  start(questId: string): void {
    if (this.active.has(questId) || this.completed.has(questId)) return;
    const def = QUESTS[questId];
    if (!def) return;

    const state: ActiveQuestState = {
      id: questId, stepIndex: 0,
      progress: def.steps.map(() => 0),
    };
    this.active.set(questId, state);

    EventBus.emit(EV.QUEST_STARTED, {
      questId, name: def.name, stepInstruction: def.steps[0].instruction,
    });

    if (!this.tracked) this.setTracked(questId);
  }

  reportKill(enemyType: string, count = 1): void {
    this.forEachActive((def, state, step) => {
      if (step.type === 'kill' && step.target === enemyType) this.bump(def, state, count);
    });
  }

  reportCollect(itemId: string): void {
    this.forEachActive((def, state, step) => {
      if (step.type === 'collect' && step.target === itemId) this.bump(def, state, 1);
    });
  }

  reportTalk(npcId: string): void {
    this.forEachActive((def, state, step) => {
      if (step.type === 'talk' && step.target === npcId) this.bump(def, state, 1);
    });
  }

  reportEnterLevel(levelId: string): void {
    this.forEachActive((def, state, step) => {
      if (step.type === 'enter-level' && step.target === levelId) this.bump(def, state, 1);
    });
  }

  /** For flag-based steps (e.g. "hasWeapon"). */
  reportFlag(flagName: string): void {
    this.forEachActive((def, state, step) => {
      if (step.type === 'flag' && step.target === flagName) this.bump(def, state, 1);
    });
  }

  /** Swap an active quest to another definition, preserving progress. */
  upgrade(oldId: string, newId: string): void {
    const state = this.active.get(oldId);
    if (!state) return;
    const newDef = QUESTS[newId];
    if (!newDef) return;

    const newProgress = newDef.steps.map((_, i) =>
      i < state.progress.length ? state.progress[i] : 0,
    );
    const newStepIndex = Math.min(state.stepIndex, newDef.steps.length - 1);

    this.active.delete(oldId);
    this.active.set(newId, { id: newId, stepIndex: newStepIndex, progress: newProgress });

    if (this.tracked === oldId) {
      this.tracked = newId;
      EventBus.emit(EV.QUEST_TRACKED, { questId: newId });
    }

    const step = newDef.steps[newStepIndex];
    if (step) {
      EventBus.emit(EV.QUEST_UPDATED, {
        questId: newId,
        stepInstruction: step.instruction,
        progress: newProgress[newStepIndex] ?? 0,
        target: step.count ?? 1,
      });
    }
  }

  // ----------------------------------------------------------
  // Tracking
  // ----------------------------------------------------------

  setTracked(id: string | null): void {
    if (id && !this.active.has(id) && !this.completed.has(id)) return;
    this.tracked = id;
    EventBus.emit(EV.QUEST_TRACKED, { questId: id });
  }

  getTrackedId(): string | null { return this.tracked; }

  getTracked(): { def: QuestDef; state: ActiveQuestState } | null {
    if (!this.tracked) return null;
    const def = QUESTS[this.tracked];
    const state = this.active.get(this.tracked);
    if (!def || !state) return null;
    return { def, state };
  }

  getAllActive(): { def: QuestDef; state: ActiveQuestState }[] {
    const out: { def: QuestDef; state: ActiveQuestState }[] = [];
    for (const [id, state] of this.active) {
      const def = QUESTS[id];
      if (def) out.push({ def, state });
    }
    return out;
  }

  getCompleted(): QuestDef[] {
    const out: QuestDef[] = [];
    for (const id of this.completed) {
      const def = QUESTS[id];
      if (def) out.push(def);
    }
    return out;
  }

  isActive(questId: string): boolean { return this.active.has(questId); }
  isCompleted(questId: string): boolean { return this.completed.has(questId); }

  getCurrentStep(questId: string): QuestStep | null {
    const state = this.active.get(questId);
    if (!state) return null;
    return QUESTS[questId].steps[state.stepIndex] ?? null;
  }

  reset(): void {
    this.active.clear();
    this.completed.clear();
    this.tracked = null;
  }

  // ----------------------------------------------------------

  private forEachActive(
    fn: (def: QuestDef, state: ActiveQuestState, step: QuestStep) => void,
  ): void {
    for (const [id, state] of this.active) {
      const def = QUESTS[id];
      const step = def.steps[state.stepIndex];
      if (step) fn(def, state, step);
    }
  }

  private bump(def: QuestDef, state: ActiveQuestState, amount: number): void {
    const step = def.steps[state.stepIndex];
    if (!step) return;
    const target = step.count ?? 1;

    state.progress[state.stepIndex] = Math.min(
      target, state.progress[state.stepIndex] + amount,
    );
    const done = state.progress[state.stepIndex] >= target;

    if (done && state.stepIndex >= def.steps.length - 1) {
      this.complete(def.id);
      return;
    }

    if (done) {
      state.stepIndex++;
      EventBus.emit(EV.QUEST_UPDATED, {
        questId: def.id,
        stepInstruction: def.steps[state.stepIndex].instruction,
        progress: 0,
        target: def.steps[state.stepIndex].count ?? 1,
      });
    } else {
      EventBus.emit(EV.QUEST_UPDATED, {
        questId: def.id,
        stepInstruction: step.instruction,
        progress: state.progress[state.stepIndex],
        target,
      });
    }
  }

  private complete(questId: string): void {
    const def = QUESTS[questId];
    this.active.delete(questId);
    this.completed.add(questId);

    // 1. Emit completion FIRST so the tracker can display its message.
    EventBus.emit(EV.QUEST_COMPLETED, {
      questId, name: def.name, rewards: def.rewards,
    });

    // 2. Then clear tracking. Tracker will ignore the null while
    //    its hideTimer is running.
    if (this.tracked === questId) this.setTracked(null);
  }
}

export const QuestSystem = new QuestSystemImpl();