// ============================================================
// src/config/Levels.ts
// Act 1 world: House → Village → Path → Ruins
// ============================================================

import type { EnemyType } from './Enemies';

export interface PlatformDef { x: number; y: number; w: number; h: number; ground?: boolean; }

export type PickupKind = 'health' | 'item' | 'quest' | 'backpack';
export interface PickupDef {
  x: number; y: number;
  kind?: PickupKind;
  itemId?: string;
  itemName?: string;
}

export interface NpcDef {
  id: string;
  x: number; y: number;
  texture: string;
  dialogueKey: string;
  autoTriggerX?: number;
}

export interface SpawnDef { type: EnemyType; x: number; y?: number; }
export interface WaveDef { trigger: number; spawns: SpawnDef[]; }
export interface GoalDef { x: number; y: number; w: number; h: number; }

export interface ReturnPortalDef {
  goal: GoalDef;
  destination: string;
  label: string;
}

export interface LevelDef {
  id: string;
  name: string;
  width: number;
  groundY: number;
  background: 'village' | 'path' | 'ruins';
  next?: string;
  endMessage?: string;
  platforms: PlatformDef[];
  pickups: PickupDef[];
  npcs: NpcDef[];
  waves: WaveDef[];
  goal: GoalDef;
  returnPortal?: ReturnPortalDef;
  spawn: { x: number; y: number };
  combatEnabled: boolean;
  tutorial?: 'battle';
}

// --- HOUSE ---
const HOUSE_PLATFORMS: PlatformDef[] = [
  { x: 0, y: 300, w: 320, h: 120, ground: true },
];

// --- VILLAGE ---
const VILLAGE_PLATFORMS: PlatformDef[] = [
  { x: 0, y: 300, w: 1800, h: 120, ground: true },
  { x: 300, y: 255, w: 100, h: 12 },
  { x: 1100, y: 240, w: 120, h: 12 },
];
const VILLAGE_NPCS: NpcDef[] = [
  { id: 'miller',     x: 350,  y: 300, texture: 'npc-miller',     dialogueKey: 'miller-first' },
  { id: 'girl',       x: 650,  y: 300, texture: 'npc-girl',       dialogueKey: 'girl-first' },
  { id: 'blacksmith', x: 1000, y: 300, texture: 'npc-blacksmith', dialogueKey: 'blacksmith-first' },
  { id: 'elder',      x: 1450, y: 300, texture: 'npc-elder',      dialogueKey: 'elder-first', autoTriggerX: 1500 },
];

// --- PATH ---
const PATH_PLATFORMS: PlatformDef[] = [
  { x: 0, y: 300, w: 1400, h: 120, ground: true },
  { x: 200, y: 240, w: 90, h: 12 },
  { x: 500, y: 220, w: 100, h: 12 },
  { x: 800, y: 240, w: 80, h: 12 },
];
const PATH_NPCS: NpcDef[] = [
  { id: 'merchant', x: 350, y: 300, texture: 'npc-merchant', dialogueKey: 'merchant-first' },
];

// --- RUINS ---
const RUINS_PLATFORMS: PlatformDef[] = [
  { x: 0, y: 300, w: 2800, h: 120, ground: true },
  { x: 300, y: 250, w: 80,  h: 12 },
  { x: 450, y: 220, w: 100, h: 12 },
  { x: 620, y: 240, w: 90,  h: 12 },
  { x: 800, y: 200, w: 120, h: 12 },
  { x: 1000, y: 250, w: 100, h: 12 },
  { x: 1200, y: 220, w: 90, h: 12 },
  { x: 1400, y: 245, w: 100, h: 12 },
  { x: 1600, y: 210, w: 120, h: 12 },
  { x: 1820, y: 240, w: 90, h: 12 },
  { x: 2000, y: 215, w: 100, h: 12 },
  { x: 2200, y: 250, w: 80, h: 12 },
  { x: 2380, y: 220, w: 100, h: 12 },
];
const RUINS_PICKUPS: PickupDef[] = [
  { x: 620, y: 226 }, { x: 1030, y: 236 }, { x: 1430, y: 231 },
  { x: 2030, y: 201 }, { x: 2410, y: 206 },
];
const RUINS_WAVES: WaveDef[] = [
  { trigger: 700,  spawns: [{ type: 'void-stalker', x: 850 }] },
  { trigger: 1050, spawns: [{ type: 'void-stalker', x: 1200 }, { type: 'void-stalker', x: 1300 }] },
  { trigger: 1500, spawns: [{ type: 'void-stalker', x: 1650 }, { type: 'void-stalker', x: 1750 }] },
  { trigger: 1900, spawns: [{ type: 'void-stalker', x: 2050 }, { type: 'void-stalker', x: 2150 }] },
  { trigger: 2300, spawns: [{ type: 'void-stalker', x: 2400 }, { type: 'void-stalker', x: 2500 }, { type: 'void-stalker', x: 2600 }] },
];

export const LEVELS: Record<string, LevelDef> = {
  house: {
    id: 'house',
    name: 'Your Room',
    width: 320,
    groundY: 300,
    background: 'village',
    next: 'village',
    platforms: HOUSE_PLATFORMS,
    pickups: [],
    npcs: [],
    waves: [],
    goal: { x: 270, y: 240, w: 32, h: 60 },  // door
    spawn: { x: 60, y: 280 },
    combatEnabled: false,
  },
  village: {
    id: 'village',
    name: 'Aethelgard Village',
    width: 1800,
    groundY: 300,
    background: 'village',
    next: 'path',
    platforms: VILLAGE_PLATFORMS,
    pickups: [],
    npcs: VILLAGE_NPCS,
    waves: [],
    goal: { x: 1740, y: 236, w: 32, h: 64 },
    spawn: { x: 40, y: 280 },
    combatEnabled: false,
  },
  path: {
    id: 'path',
    name: 'Path to the Ruins',
    width: 1400,
    groundY: 300,
    background: 'path',
    next: 'ruins',
    platforms: PATH_PLATFORMS,
    pickups: [],
    npcs: PATH_NPCS,
    waves: [],
    goal: { x: 1340, y: 236, w: 32, h: 64 },
    returnPortal: { goal: { x: 20, y: 236, w: 32, h: 64 }, destination: 'village', label: 'Village' },
    spawn: { x: 80, y: 280 },
    combatEnabled: false,
  },
  ruins: {
    id: 'ruins',
    name: 'Ruins of the Old Gates',
    width: 2800,
    groundY: 300,
    background: 'ruins',
    next: undefined,
    endMessage: 'The sealed door holds fast.\nAct 2 awaits...',
    platforms: RUINS_PLATFORMS,
    pickups: RUINS_PICKUPS,
    npcs: [],
    waves: RUINS_WAVES,
    goal: { x: 2740, y: 236, w: 32, h: 64 },
    returnPortal: { goal: { x: 20, y: 236, w: 32, h: 64 }, destination: 'path', label: 'Path' },
    spawn: { x: 80, y: 280 },
    combatEnabled: true,
    tutorial: 'battle',
  },
};

export const DEFAULT_LEVEL = 'house';