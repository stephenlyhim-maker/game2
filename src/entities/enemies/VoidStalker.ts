// src/entities/enemies/VoidStalker.ts
import { Enemy } from '../Enemy';
import { ENEMIES } from '../../config/Enemies';
import type { GameScene } from '../../scenes/GameScene';
import type { Player } from '../Player';

export class VoidStalker extends Enemy {
  constructor(scene: GameScene, x: number, y?: number) {
    super(scene, x, y, ENEMIES['void-stalker']);
  }

  protected override updateBehavior(dtMs: number, player: Player): void {
    this.walkerAI(dtMs, player);
  }
}