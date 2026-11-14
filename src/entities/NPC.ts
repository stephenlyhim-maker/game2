// ============================================================
// src/entities/NPC.ts
// Simple interactable NPC. Triggers a dialogue when player is near
// and presses E.
// ============================================================

import Phaser from 'phaser';
import { DEPTH } from '../config/GameConfig';
import type { NpcDef } from '../config/Levels';
import type { Player } from './Player';

export class NPC extends Phaser.GameObjects.Image {
  readonly def: NpcDef;
  readonly interactRange = 44;

  private prompt: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, def: NpcDef) {
    super(scene, def.x, def.y, def.texture);
    this.def = def;

    scene.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(DEPTH.ENEMY);

    this.prompt = scene.add
      .text(def.x, def.y - 44, '[E] Talk', {
        fontFamily: 'monospace',
        fontSize: '9px',
        fontStyle: 'bold',
        color: '#ffe08a',
        backgroundColor: '#080610',
        padding: { left: 4, right: 4, top: 2, bottom: 2 },
      })
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.FX)
      .setVisible(false);
  }

  isInRange(player: Player): boolean {
    const dx = (this.x) - (player.x + player.width / 2);
    const dy = (this.y) - (player.y + player.height / 2);
    return Math.abs(dx) < this.interactRange && Math.abs(dy) < 60;
  }

  interactable = true;

  update(player: Player): void {
    const near = this.isInRange(player);
    this.prompt.setVisible(near && this.interactable);
  }

  destroy(fromScene?: boolean): void {
    this.prompt.destroy();
    super.destroy(fromScene);
  }
}