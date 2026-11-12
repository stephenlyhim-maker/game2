// ============================================================
// src/core/EventBus.ts
// Global event bus + payload types. Scenes talk through this
// instead of holding references to each other.
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
} as const;

export interface PlayerStatsPayload {
  hp: number;
  maxHp: number;
  special: number;
  specialReady: boolean;
  xp: number;
  kills: number;
}

export interface RunEndedPayload {
  win: boolean;
  timeSec: number;
  kills: number;
  xp: number;
  rank: string;
}

export interface HintPayload {
  text: string;
  durationMs: number;
}

export function computeRank(kills: number, xp: number): string {
  if (kills === 0) return 'PACIFIST';
  if (xp >= 400) return 'S';
  if (xp >= 250) return 'A';
  if (xp >= 120) return 'B';
  return 'C';
}