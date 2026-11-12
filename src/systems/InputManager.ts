// ============================================================
// src/systems/InputManager.ts
// Maps raw keys to abstract actions so rebinding / gamepads /
// touch controls can be added later without touching gameplay.
// ============================================================

import Phaser from 'phaser';

export type Action =
  | 'left'
  | 'right'
  | 'jump'
  | 'dash'
  | 'special'
  | 'restart'
  | 'confirm'
  | 'cancel';

const ACTIONS: Action[] = ['left', 'right', 'jump', 'dash', 'special', 'restart', 'confirm', 'cancel'];

export class InputManager {
  private keys: Record<Action, Phaser.Input.Keyboard.Key[]> = {
    left: [],
    right: [],
    jump: [],
    dash: [],
    special: [],
    restart: [],
    confirm: [],
    cancel: [],
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
    };

    (Object.keys(map) as Action[]).forEach((action) => {
      this.keys[action] = map[action].map((k) => kb.addKey(k, true, true));
    });

    kb.addCapture(['W', 'A', 'S', 'D', 'J', 'K', 'R', 'SPACE', 'UP', 'DOWN', 'LEFT', 'RIGHT', 'ENTER']);
  }

  /** Call once per frame, before anything else. */
  update(): void {
    this.just.clear();
    this.down.clear();

    for (const action of ACTIONS) {
      let isDown = false;
      let wasJustPressed = false;
      for (const key of this.keys[action]) {
        if (key.isDown) isDown = true;
        if (Phaser.Input.Keyboard.JustDown(key)) wasJustPressed = true;
      }
      if (isDown) this.down.add(action);
      if (wasJustPressed) this.just.add(action);
    }
  }

  isDown(action: Action): boolean {
    return this.down.has(action);
  }

  justPressed(action: Action): boolean {
    return this.just.has(action);
  }
}