// ============================================================
// src/systems/Progression.ts
// ============================================================

export interface SpawnPoint { x: number; y: number; }
export interface InventoryItem { id: string; name: string; qty: number; }

export interface ProgressionState {
  currentLevel: string;
  spawnAt: SpawnPoint | null;

  seenLyraAwakening: boolean;
  seenLyraRuinsEntry: boolean;
  seenMerchantIntro: boolean;
  seenMerchantRuins: boolean;
  seenMerchantGone: boolean;
  visitedRuins: boolean;
  fledFromRuins: boolean;

  elderWarned: boolean;
  elderSentToBlacksmith: boolean;
  elderGaveBackpack: boolean;

  battleTutorialDone: boolean;
  backpackTutorialDone: boolean;
  exchangeUnlocked: boolean;

  hasWeapon: boolean;
  hasBackpack: boolean;

  merchantTrusted: boolean;
  merchantAccepted: boolean;
  merchantGone: boolean;

  dollsEchoKills: number;
  dollsEchoLocketCollected: boolean;
  hasShardOfResonance: boolean;

  inventory: InventoryItem[];
}

const defaultState = (): ProgressionState => ({
  currentLevel: 'house',
  spawnAt: null,
  seenLyraAwakening: false,
  seenLyraRuinsEntry: false,
  seenMerchantIntro: false,
  seenMerchantRuins: false,
  seenMerchantGone: false,
  visitedRuins: false,
  fledFromRuins: false,
  elderWarned: false,
  elderSentToBlacksmith: false,
  elderGaveBackpack: false,
  battleTutorialDone: false,
  backpackTutorialDone: false,
  exchangeUnlocked: false,
  hasWeapon: false,
  hasBackpack: false,
  merchantTrusted: false,
  merchantAccepted: false,
  merchantGone: false,
  dollsEchoKills: 0,
  dollsEchoLocketCollected: false,
  hasShardOfResonance: false,
  inventory: [],
});

export interface ProgressionMethods {
  reset(): void;
  addItem(id: string, name: string, qty?: number): void;
  removeItem(id: string, qty?: number): void;
  hasItem(id: string): boolean;
}

export const Progression: ProgressionState & ProgressionMethods = {
  ...defaultState(),

  reset(): void {
    Object.assign(this, defaultState());
  },

  addItem(id, name, qty = 1): void {
    const existing = this.inventory.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else this.inventory.push({ id, name, qty });
  },

  removeItem(id, qty = 1): void {
    const item = this.inventory.find(i => i.id === id);
    if (!item) return;
    item.qty -= qty;
    if (item.qty <= 0) this.inventory = this.inventory.filter(i => i.id !== id);
  },

  hasItem(id): boolean {
    return this.inventory.some(i => i.id === id && i.qty > 0);
  },
};