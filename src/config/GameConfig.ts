// ============================================================
// src/config/GameConfig.ts
// Global tuning constants. Everything is in px/second.
// ============================================================

export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 360;
export const GROUND_Y = 300;

export const PHYS = {
  GRAVITY: 0.72 * 3600,
  MAX_FALL: 13 * 60,
  RUN_ACCEL: 0.85 * 3600,
  RUN_MAX: 3.3 * 60,
  RUN_FRICTION_PER_FRAME: 0.78,
  JUMP: -9.3 * 60,
  DOUBLE_JUMP: -8.4 * 60,
  HOVER_GRAVITY: 0.11 * 3600,
  HOVER_MS: (20 / 60) * 1000,
} as const;

export const PLAYER = {
  W: 14,
  H: 20,
  MAX_HP: 100,
  DASH_SPEED: 9.5 * 60,
  DASH_MS: (12 / 60) * 1000,
  DASH_CD_MS: (38 / 60) * 1000,
  DASH_DMG: 2,
  DASH_INVULN_MS: (14 / 60) * 1000,
  DASH_SPECIAL_GAIN: 14,
  SPECIAL_DMG: 5,
  SPECIAL_RADIUS: 100,
  SPECIAL_ARC: (Math.PI * 2) / 3,
  SPECIAL_MS: (22 / 60) * 1000,
  SPECIAL_APPLY_REMAINING: (22 / 60) * 1000 * (15 / 22),
  INVULN_MS: (65 / 60) * 1000,
  KNOCKBACK_X: 4.6 * 60,
  KNOCKBACK_Y: -4.6 * 60,
} as const;

export const DEPTH = {
  SKY: -1000,
  BG_STARS: -990,
  BG_MOON: -980,
  BG_FAR: -970,
  BG_MID: -960,
  BG_NEAR: -950,
  TERRAIN: 0,
  PICKUP: 10,
  ENEMY: 20,
  PROJECTILE: 25,
  PARTICLE: 35,
  PLAYER: 40,
  FX: 50,
} as const;

export const SCENES = {
  BOOT: 'BootScene',
  TITLE: 'TitleScene',
  GAME: 'GameScene',
  UI: 'UIScene',
  DIALOGUE: 'DialogueScene',
} as const;