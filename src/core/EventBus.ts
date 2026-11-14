// ============================================================
// src/core/EventBus.ts
// ============================================================

import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

export const EV = {
  PLAYER_STATS: 'player-stats',
  RUN_STARTED: 'run-started',
  RUN_ENDED: 'run-ended',
  HINT: 'hint',
  TOAST: 'toast',
  DIALOGUE_START: 'dialogue-start',
  DIALOGUE_END: 'dialogue-end',

  QUEST_STARTED: 'quest-started',
  QUEST_TRACKED: 'quest-tracked',
  QUEST_UPDATED: 'quest-updated',
  QUEST_COMPLETED: 'quest-completed',

  TUTORIAL_START: 'tutorial-start',
  TUTORIAL_STEP: 'tutorial-step',
  TUTORIAL_END: 'tutorial-end',

  EXCHANGE_START: 'exchange-start',
  EXCHANGE_END: 'exchange-end',
} as const;

export interface PlayerStatsPayload {
  hp: number; maxHp: number; special: number;
  specialReady: boolean; xp: number; kills: number;
}

export interface RunEndedPayload {
  win: boolean; timeSec: number; kills: number; xp: number; rank: string;
  message?: string;
}

export interface HintPayload { text: string; durationMs: number; }
export interface ToastPayload { text: string; }

export interface QuestStartedPayload {
  questId: string; name: string; stepInstruction: string;
}

export interface QuestTrackedPayload { questId: string | null; }

export interface QuestUpdatedPayload {
  questId: string; stepInstruction: string; progress: number; target: number;
}
export interface QuestCompletedPayload {
  questId: string; name: string;
  rewards: { name: string; qty: number }[];
}

export interface TutorialStepPayload {
  stepId: string; text: string; hint?: string;
  stepNumber: number; totalSteps: number;
}

export function computeRank(kills: number, xp: number): string {
  if (kills === 0) return 'PACIFIST';
  if (xp >= 400) return 'S';
  if (xp >= 250) return 'A';
  if (xp >= 120) return 'B';
  return 'C';
}