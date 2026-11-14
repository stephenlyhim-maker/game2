// ============================================================
// src/systems/InputManager.ts
// ============================================================

import Phaser from 'phaser';

export type Action =
  | 'left' | 'right' | 'jump' | 'dash' | 'special'
  | 'restart' | 'confirm' | 'cancel'
  | 'interact' | 'backpack' | 'quests';

const ACTIONS: Action[] = [
  'left', 'right', 'jump', 'dash', 'special',
  'restart', 'confirm', 'cancel',
  'interact', 'backpack',
];

export class InputManager {
  /** When true, no inputs register (used during dialogue). */
  public blocked = false;

  private keys: Record<Action, Phaser.Input.Keyboard.Key[]> = {
    left: [], right: [], jump: [], dash: [], special: [],
    restart: [], confirm: [], cancel: [],
    interact: [], backpack: [],
  };
  private down = new Set<Action>();
  private just = new Set<Action>();

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) throw new Error('Keyboard input unavailable');

    const map: Record<Action, string[]> = {
      left: ['A', 'LEFT'],
      right: ['D', 'RIGHT'],
      jump: ['W', 'UP', 'SPACE'],
      dash: ['J'],
      special: ['K'],
      restart: ['R'],
      confirm: ['ENTER', 'SPACE'],
      cancel: ['ESC'],
      interact: ['E'],
      backpack: ['I'],
      quests: ['Q'],
    };

    (Object.keys(map) as Action[]).forEach(action => {
      this.keys[action] = map[action].map(k => kb.addKey(k, true, true));
    });

    kb.addCapture([
      'W','A','S','D','J','K','R','E','I','Q',
      'SPACE','UP','DOWN','LEFT','RIGHT','ENTER',
    ]);
  }

  update(): void {
    this.just.clear();
    this.down.clear();
    if (this.blocked) return;
    for (const action of ACTIONS) {
      let isDown = false, wasJustPressed = false;
      for (const key of this.keys[action]) {
        if (key.isDown) isDown = true;
        if (Phaser.Input.Keyboard.JustDown(key)) wasJustPressed = true;
      }
      if (isDown) this.down.add(action);
      if (wasJustPressed) this.just.add(action);
    }
  }

  isDown(a: Action): boolean { return this.down.has(a); }
  justPressed(a: Action): boolean { return this.just.has(a); }
}