// ============================================================
// src/config/Enemies.ts
// ============================================================

export type EnemyType = 'slime' | 'void-stalker' | 'wisp';
export type AIKind = 'walker' | 'flyer';

export interface LungeDef {
  range: number; height: number; speed: number;
  durationMs: number; cooldownMs: number;
}
export interface ShootDef {
  range: number; height: number; speed: number;
  cooldownMs: number; cooldownJitterMs: number;
}
export interface DropDef {
  id: string; name: string;
  chance: number; qtyMin: number; qtyMax: number;
  quest?: boolean;
}
export interface EnemyDef {
  type: EnemyType;
  texture: string;
  hp: number; dmg: number; speed: number;
  w: number; h: number; xp: number;
  color: string;
  ai: AIKind;
  aggroRange?: number;
  aggroHeight?: number;
  patrolRange?: number;
  lunge?: LungeDef;
  shoot?: ShootDef;
  bob?: { amplitude: number; speed: number };
  drops?: DropDef[];
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  slime: {
    type: 'slime', texture: 'enemy-slime', hp: 2, dmg: 8,
    speed: 0.45 * 60, w: 16, h: 14, xp: 10, color: '#5ed46a',
    ai: 'walker', aggroRange: 175, aggroHeight: 90, patrolRange: 80,
    drops: [{ id: 'slime-gel', name: 'Slime Gel', chance: 0.6, qtyMin: 1, qtyMax: 1 }],
  },
  'void-stalker': {
    // Formerly 'goblin' — repurposed as the story's Void Stalker.
    type: 'void-stalker', texture: 'enemy-void-stalker',
    hp: 4, dmg: 13, speed: 1.0 * 60, w: 14, h: 20, xp: 25,
    color: '#a060e0',
    ai: 'walker', aggroRange: 300, aggroHeight: 100, patrolRange: 80,
    lunge: {
      range: 90, height: 50, speed: 3.4 * 60,
      durationMs: (16 / 60) * 1000, cooldownMs: (100 / 60) * 1000,
    },
    drops: [
      { id: 'void-fragment', name: 'Void Fragment', chance: 0.70, qtyMin: 1, qtyMax: 2 },
      { id: 'stalker-core',  name: 'Stalker Core',  chance: 0.35, qtyMin: 1, qtyMax: 1 },
    ],
  },
  wisp: {
    type: 'wisp', texture: 'enemy-wisp', hp: 6, dmg: 14,
    speed: 0.6 * 60, w: 14, h: 14, xp: 40, color: '#9a6ae0',
    ai: 'flyer',
    shoot: { range: 400, height: 250, speed: 2.3 * 60,
      cooldownMs: (105 / 60) * 1000, cooldownJitterMs: (70 / 60) * 1000 },
    bob: { amplitude: 9, speed: 0.0036 },
    drops: [{ id: 'wisp-ember', name: 'Wisp Ember', chance: 0.7, qtyMin: 1, qtyMax: 1 }],
  },
};