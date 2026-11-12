// ============================================================
// src/config/Characters.ts
// Playable characters. Used by CharacterSelectScene later —
// the Player reads these values on spawn.
// ============================================================

export interface CharacterDef {
  id: string;
  name: string;
  description: string;
  texture: string;
  maxHp: number;
  runSpeed: number;
  jumpVelocity: number;
  specialName: string;
  unlockedByDefault: boolean;
}

export const CHARACTERS: Record<string, CharacterDef> = {
  blade: {
    id: 'blade',
    name: 'Blade',
    description: 'A wandering swordsman from another world.',
    texture: 'player',
    maxHp: 100,
    runSpeed: 3.3 * 60,
    jumpVelocity: -9.3 * 60,
    specialName: 'Grand Sweep',
    unlockedByDefault: true,
  },
};

export const DEFAULT_CHARACTER = 'blade';