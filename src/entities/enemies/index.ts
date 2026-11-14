// src/entities/enemies/index.ts
import type { EnemyType } from '../../config/Enemies';
import type { GameScene } from '../../scenes/GameScene';
import type { Enemy } from '../Enemy';
import { Slime } from './Slime';
import { VoidStalker } from './VoidStalker';
import { Wisp } from './Wisp';

export function createEnemy(scene: GameScene, type: EnemyType, x: number, y?: number): Enemy {
  switch (type) {
    case 'slime':        return new Slime(scene, x, y);
    case 'void-stalker': return new VoidStalker(scene, x, y);
    case 'wisp':         return new Wisp(scene, x, y);
  }
}