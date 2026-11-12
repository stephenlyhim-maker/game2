// ============================================================
// src/entities/enemies/index.ts
// Enemy factory — register new mobs here.
// ============================================================

import type { EnemyType } from '../../config/Enemies';
import type { GameScene } from '../../scenes/GameScene';
import type { Enemy } from '../Enemy';
import { Slime } from './Slime';
import { Goblin } from './Goblin';
import { Wisp } from './Wisp';

export function createEnemy(scene: GameScene, type: EnemyType, x: number, y?: number): Enemy {
  switch (type) {
    case 'slime':
      return new Slime(scene, x, y);
    case 'goblin':
      return new Goblin(scene, x, y);
    case 'wisp':
      return new Wisp(scene, x, y);
  }
}