// ============================================================
// src/systems/SaveSystem.ts
// ============================================================

export interface SaveData {
  bestTimeSec: number;
  bestRank: string;
  unlockedCharacters: string[];
  gold: number;
  inventory: { id: string; qty: number }[];
  tutorialDone: boolean;
}

const KEY = 'isekai-blade-save-v2';

const DEFAULTS: SaveData = {
  bestTimeSec: 0,
  bestRank: '-',
  unlockedCharacters: ['blade'],
  gold: 0,
  inventory: [],
  tutorialDone: false,
};

export const SaveSystem = {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SaveData>) };
    } catch { return { ...DEFAULTS }; }
  },
  save(data: SaveData): void {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  },
  update(patch: Partial<SaveData>): SaveData {
    const next = { ...this.load(), ...patch };
    this.save(next);
    return next;
  },
};