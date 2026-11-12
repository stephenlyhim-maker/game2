// src/entities/enemies/Wisp.ts
import { Enemy } from '../Enemy';
import { ENEMIES } from '../../config/Enemies';
import type { GameScene } from '../../scenes/GameScene';
import type { Player } from '../Player';

export class Wisp extends Enemy {
  constructor(scene: GameScene, x: number, y?: number) {
    super(scene, x, y, ENEMIES.wisp);
  }

  protected override updateBehavior(dtMs: number, player: Player): void {
    this.flyerAI(dtMs, player);
  }
}