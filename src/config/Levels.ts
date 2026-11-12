// ============================================================
// src/config/Levels.ts
// Level definitions. Add a new object to LEVELS to add a stage.
// ============================================================

import type { EnemyType } from './Enemies';

export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  h: number;
  ground?: boolean;
}

export interface PickupDef {
  x: number;
  y: number;
  kind?: 'health';
}

export interface SpawnDef {
  type: EnemyType;
  x: number;
  y?: number;
}

export interface WaveDef {
  trigger: number;
  spawns: SpawnDef[];
}

export interface GoalDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LevelDef {
  id: string;
  name: string;
  width: number;
  groundY: number;
  platforms: PlatformDef[];
  pickups: PickupDef[];
  waves: WaveDef[];
  goal: GoalDef;
  spawn: { x: number; y: number };
}

const VALLEY_PLATFORMS: PlatformDef[] = [
  { x: 0, y: 300, w: 5600, h: 120, ground: true },
  { x: 330, y: 250, w: 90, h: 12 },
  { x: 490, y: 225, w: 70, h: 12 },
  { x: 660, y: 255, w: 110, h: 12 },
  { x: 850, y: 220, w: 90, h: 12 },
  { x: 1010, y: 250, w: 70, h: 12 },
  { x: 1170, y: 230, w: 100, h: 12 },
  { x: 1360, y: 260, w: 70, h: 12 },
  { x: 1520, y: 225, w: 110, h: 12 },
  { x: 1760, y: 250, w: 90, h: 12 },
  { x: 1920, y: 215, w: 70, h: 12 },
  { x: 2120, y: 245, w: 100, h: 12 },
  { x: 2320, y: 260, w: 70, h: 12 },
  { x: 2510, y: 225, w: 110, h: 12 },
  { x: 2760, y: 250, w: 90, h: 12 },
  { x: 2920, y: 215, w: 70, h: 12 },
  { x: 3120, y: 255, w: 100, h: 12 },
  { x: 3320, y: 230, w: 90, h: 12 },
  { x: 3520, y: 260, w: 70, h: 12 },
  { x: 3710, y: 220, w: 110, h: 12 },
  { x: 3960, y: 250, w: 90, h: 12 },
  { x: 4120, y: 215, w: 70, h: 12 },
  { x: 4320, y: 245, w: 100, h: 12 },
  { x: 4520, y: 260, w: 70, h: 12 },
  { x: 4710, y: 225, w: 110, h: 12 },
  { x: 4960, y: 250, w: 90, h: 12 },
  { x: 5120, y: 220, w: 70, h: 12 },
  { x: 5300, y: 250, w: 90, h: 12 },
];

const VALLEY_PICKUPS: PickupDef[] = [
  { x: 360, y: 236 }, { x: 680, y: 241 }, { x: 1200, y: 216 }, { x: 1550, y: 211 },
  { x: 2150, y: 231 }, { x: 2540, y: 211 }, { x: 3150, y: 241 }, { x: 3740, y: 206 },
  { x: 4350, y: 231 }, { x: 4740, y: 211 }, { x: 5330, y: 236 },
];

const VALLEY_WAVES: WaveDef[] = [
  { trigger: 120, spawns: [{ type: 'slime', x: 420 }, { type: 'slime', x: 520 }] },
  { trigger: 620, spawns: [{ type: 'slime', x: 760 }, { type: 'goblin', x: 860 }, { type: 'slime', x: 940 }] },
  { trigger: 1080, spawns: [{ type: 'goblin', x: 1200 }, { type: 'goblin', x: 1320 }, { type: 'wisp', x: 1260, y: 170 }] },
  { trigger: 1620, spawns: [{ type: 'slime', x: 1740 }, { type: 'slime', x: 1820 }, { type: 'wisp', x: 1900, y: 160 }, { type: 'goblin', x: 1960 }] },
  { trigger: 2200, spawns: [{ type: 'goblin', x: 2320 }, { type: 'goblin', x: 2420 }, { type: 'slime', x: 2500 }, { type: 'wisp', x: 2360, y: 155 }] },
  { trigger: 2800, spawns: [{ type: 'wisp', x: 2900, y: 150 }, { type: 'wisp', x: 3020, y: 170 }, { type: 'goblin', x: 2960 }, { type: 'goblin', x: 3060 }] },
  { trigger: 3380, spawns: [{ type: 'slime', x: 3480 }, { type: 'goblin', x: 3560 }, { type: 'goblin', x: 3640 }, { type: 'wisp', x: 3580, y: 160 }] },
  { trigger: 3980, spawns: [{ type: 'wisp', x: 4080, y: 150 }, { type: 'wisp', x: 4180, y: 180 }, { type: 'goblin', x: 4140 }, { type: 'slime', x: 4240 }, { type: 'goblin', x: 4320 }] },
  { trigger: 4560, spawns: [{ type: 'goblin', x: 4680 }, { type: 'goblin', x: 4740 }, { type: 'wisp', x: 4700, y: 155 }, { type: 'wisp', x: 4800, y: 175 }, { type: 'slime', x: 4840 }] },
  { trigger: 5060, spawns: [{ type: 'goblin', x: 5180 }, { type: 'wisp', x: 5230, y: 160 }, { type: 'wisp', x: 5290, y: 150 }, { type: 'goblin', x: 5330 }] },
];

export const LEVELS: Record<string, LevelDef> = {
  valley: {
    id: 'valley',
    name: 'Dusk Valley',
    width: 5600,
    groundY: 300,
    platforms: VALLEY_PLATFORMS,
    pickups: VALLEY_PICKUPS,
    waves: VALLEY_WAVES,
    goal: { x: 5450, y: 300 - 64, w: 32, h: 64 },
    spawn: { x: 60, y: 300 - 20 },
  },
};

export const DEFAULT_LEVEL = 'valley';