// ============================================================
// src/config/Enemies.ts
// Data-driven enemy definitions. Add a new entry + a subclass
// in src/entities/enemies to create a new mob.
// ============================================================

export type EnemyType = 'slime' | 'goblin' | 'wisp';
export type AIKind = 'walker' | 'flyer';

export interface LungeDef {
  range: number;
  height: number;
  speed: number;
  durationMs: number;
  cooldownMs: number;
}

export interface ShootDef {
  range: number;
  height: number;
  speed: number;
  cooldownMs: number;
  cooldownJitterMs: number;
}

export interface EnemyDef {
  type: EnemyType;
  texture: string;
  hp: number;
  dmg: number;
  speed: number;
  w: number;
  h: number;
  xp: number;
  color: string;
  ai: AIKind;
  aggroRange?: number;
  aggroHeight?: number;
  patrolRange?: number;
  lunge?: LungeDef;
  shoot?: ShootDef;
  bob?: { amplitude: number; speed: number };
}

export const ENEMIES: Record<EnemyType, EnemyDef> = {
  slime: {
    type: 'slime',
    texture: 'enemy-slime',
    hp: 2,
    dmg: 8,
    speed: 0.45 * 60,
    w: 16,
    h: 14,
    xp: 10,
    color: '#5ed46a',
    ai: 'walker',
    aggroRange: 175,
    aggroHeight: 90,
    patrolRange: 80,
  },
  goblin: {
    type: 'goblin',
    texture: 'enemy-goblin',
    hp: 4,
    dmg: 13,
    speed: 1.0 * 60,
    w: 14,
    h: 20,
    xp: 25,
    color: '#c07a3a',
    ai: 'walker',
    aggroRange: 300,
    aggroHeight: 90,
    patrolRange: 80,
    lunge: {
      range: 74,
      height: 42,
      speed: 3.4 * 60,
      durationMs: (14 / 60) * 1000,
      cooldownMs: (115 / 60) * 1000,
    },
  },
  wisp: {
    type: 'wisp',
    texture: 'enemy-wisp',
    hp: 6,
    dmg: 14,
    speed: 0.6 * 60,
    w: 14,
    h: 14,
    xp: 40,
    color: '#9a6ae0',
    ai: 'flyer',
    shoot: {
      range: 400,
      height: 250,
      speed: 2.3 * 60,
      cooldownMs: (105 / 60) * 1000,
      cooldownJitterMs: (70 / 60) * 1000,
    },
    bob: { amplitude: 9, speed: 0.0036 },
  },
};