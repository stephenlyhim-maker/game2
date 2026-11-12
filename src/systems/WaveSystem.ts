// ============================================================
// src/systems/WaveSystem.ts
// Spawns enemies when the player crosses a trigger X.
// Swap for a spawner that reads from a JSON file later.
// ============================================================

import type { WaveDef } from '../config/Levels';
import type { EnemyType } from '../config/Enemies';

export class WaveSystem {
  private spawned: boolean[];

  constructor(private waves: WaveDef[], private spawn: (type: EnemyType, x: number, y?: number) => void) {
    this.spawned = waves.map(() => false);
  }

  update(playerX: number): void {
    for (let i = 0; i < this.waves.length; i++) {
      if (this.spawned[i]) continue;
      if (playerX > this.waves[i].trigger) {
        this.spawned[i] = true;
        for (const s of this.waves[i].spawns) {
          this.spawn(s.type, s.x, s.y);
        }
      }
    }
  }

  reset(): void {
    this.spawned = this.waves.map(() => false);
  }
}