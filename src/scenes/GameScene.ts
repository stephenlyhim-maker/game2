// ============================================================
// src/scenes/GameScene.ts
// ============================================================

import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, DEPTH, SCENES } from '../config/GameConfig';
import { LEVELS, type LevelDef } from '../config/Levels';
import type { EnemyType } from '../config/Enemies';
import { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import { createEnemy } from '../entities/enemies';
import { Projectile } from '../entities/Projectile';
import { Pickup } from '../entities/Pickup';
import { Portal } from '../entities/Portal';
import { NPC } from '../entities/NPC';
import { Background } from '../gfx/Background';
import { ParticleSystem } from '../systems/ParticleSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { InputManager } from '../systems/InputManager';
import { QuestSystem } from '../systems/QuestSystem';
import { TutorialSystem } from '../systems/TutorialSystem';
import { Progression } from '../systems/Progression';
import { DIALOGUES } from '../data/dialogue';
import type { DialogueLine } from './DialogueScene';
import { EventBus, EV, computeRank, type PlayerStatsPayload } from '../core/EventBus';

const GIRL_QUEST_ID = 'dolls-echo';
const LOCKET_ITEM_ID = 'locket-of-elric';
const DIALOGUE_ZOOM = 1.8;
const EXCHANGE_ZOOM  = 1.6;

export class GameScene extends Phaser.Scene {
  level!: LevelDef;
  player!: Player;
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  pickups: Pickup[] = [];
  npcs: NPC[] = [];
  portal!: Portal;
  returnPortal?: Portal;
  fx!: ParticleSystem;

  isOver = false;
  private elapsedMs = 0;
  private hitStopMs = 0;
  private sealedCooldownMs = 0;

  private background!: Background;
  private inputMgr!: InputManager;
  private waves!: WaveSystem;
  private tutorial = new TutorialSystem();
  private transitioning = false;

  private platformGroup!: Phaser.Physics.Arcade.StaticGroup;
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private platformRects: Phaser.Geom.Rectangle[] = [];
  private specialGfx!: Phaser.GameObjects.Graphics;
  private lastStats: PlayerStatsPayload | null = null;

  private wavesEnabled = false;
  private tutorialKills = 0;
  private tutorialEnemyLive = false;
  private dashEnabledInternal = false;
  private preTutorialAmbush = false;

  private activeDialogueKey: string | null = null;
  private activeDialogueCallback: (() => void) | null = null;
  private dialogueTargetX = 0;
  private dialogueActive = false;

  private exchangeActive = false;
  private exchangeCallback: (() => void) | null = null;

  constructor() { super(SCENES.GAME); }

  get dashEnabled(): boolean { return this.dashEnabledInternal; }

  create(): void {
    this.resetSceneState();
    this.level = LEVELS[Progression.currentLevel] ?? LEVELS.house;

    this.physics.world.setBounds(0, -400, this.level.width, 1200);
    this.cameras.main.setBounds(0, -200, this.level.width, 700);
    this.cameras.main.setBackgroundColor('#05030c');

    this.background = new Background(this, this.level.background);
    this.fx = new ParticleSystem(this, 'pixel', 600);
    this.buildTerrain();

    const spawn = Progression.spawnAt ?? this.level.spawn;
    Progression.spawnAt = null;

    this.player = new Player(this, spawn.x, spawn.y);
    this.physics.add.collider(this.player, this.platformGroup);
    this.cameras.main.startFollow(this.player, true, 0.13, 0.09);

    this.portal = new Portal(this, this.level.goal, 'goal');
    if (this.level.returnPortal) {
      this.returnPortal = new Portal(this, this.level.returnPortal.goal, 'return');
    }

    for (const def of this.level.pickups) this.pickups.push(new Pickup(this, def));

    // Hide merchant after leaving on trust path
    for (const npcDef of this.level.npcs) {
      if (npcDef.id === 'merchant' && Progression.merchantGone) continue;
      const npc = new NPC(this, npcDef);
      if (npcDef.id === 'elder') npc.interactable = Progression.elderWarned;
      this.npcs.push(npc);
    }

    this.specialGfx = this.add.graphics().setDepth(DEPTH.FX);

    this.inputMgr = new InputManager(this);
    this.waves = new WaveSystem(this.level.waves, (type, x, y) => this.spawnEnemy(type, x, y));
    this.dashEnabledInternal = Progression.battleTutorialDone;

    if (!this.scene.isActive(SCENES.UI)) this.scene.launch(SCENES.UI);

    EventBus.on(EV.DIALOGUE_START, this.onDialogueStart, this);
    EventBus.on(EV.DIALOGUE_END, this.onDialogueEndGlobal, this);
    EventBus.on(EV.EXCHANGE_END, this.onExchangeEnd, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off(EV.DIALOGUE_START, this.onDialogueStart, this);
      EventBus.off(EV.DIALOGUE_END, this.onDialogueEndGlobal, this);
      EventBus.off(EV.EXCHANGE_END, this.onExchangeEnd, this);
    });

    EventBus.emit(EV.RUN_STARTED);
    this.setupLevelEntry();
    this.emitStats();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private resetSceneState(): void {
    this.isOver = false;
    this.elapsedMs = 0;
    this.hitStopMs = 0;
    this.transitioning = false;
    this.sealedCooldownMs = 0;
    this.enemies = [];
    this.projectiles = [];
    this.pickups = [];
    this.npcs = [];
    this.platformRects = [];
    this.lastStats = null;
    this.wavesEnabled = false;
    this.tutorialKills = 0;
    this.tutorialEnemyLive = false;
    this.dashEnabledInternal = false;
    this.preTutorialAmbush = false;
    this.activeDialogueKey = null;
    this.activeDialogueCallback = null;
    this.dialogueTargetX = 0;
    this.dialogueActive = false;
    this.exchangeActive = false;
    this.exchangeCallback = null;
    this.returnPortal = undefined;
    if (this.inputMgr) this.inputMgr.blocked = false;
  }

  // ----------------------------------------------------------
  // Level entry
  // ----------------------------------------------------------

  private setupLevelEntry(): void {
    const id = this.level.id;

    if (id === 'house') {
      if (!Progression.seenLyraAwakening) {
        Progression.seenLyraAwakening = true;
        this.openDialogueByKey('lyra-awakening', undefined, () => {
          QuestSystem.start('dying-world');
        });
      }
      return;
    }

    if (id === 'village') {
      // Trust: elder amazed after returning from ruins
      if (Progression.merchantTrusted &&
          Progression.battleTutorialDone &&
          Progression.seenMerchantGone &&
          !Progression.elderGaveBackpack) {
        Progression.elderGaveBackpack = true;
        this.openDialogueByKey('elder-amazed', undefined, () => this.grantBackpack());
        return;
      }

      // Non-trust: elder sends to blacksmith after flee
      if (Progression.elderWarned &&
          Progression.fledFromRuins &&
          !Progression.elderSentToBlacksmith &&
          !Progression.hasWeapon) {
        Progression.elderSentToBlacksmith = true;
        this.openDialogueByKey('elder-send');
        return;
      }

      // Non-trust: elder gives backpack after tutorial
      if (!Progression.merchantTrusted &&
          Progression.battleTutorialDone &&
          !Progression.elderGaveBackpack) {
        Progression.elderGaveBackpack = true;
        this.openDialogueByKey('elder-backpack', undefined, () => this.grantBackpack());
        return;
      }
      return;
    }

    if (id === 'ruins') {
      Progression.visitedRuins = true;
      QuestSystem.reportEnterLevel('ruins');

      if (!Progression.seenLyraRuinsEntry) {
        Progression.seenLyraRuinsEntry = true;
        this.openDialogueByKey('lyra-ruins-entry', undefined, () => {
          this.onLyraRuinsEntryComplete();
        });
        return;
      }

      this.maybeRespawnLocket();
      this.onRuinsReEntry();
      return;
    }

    if (id === 'path') {
      EventBus.emit(EV.HINT, {
        text: 'A merchant has set up camp. The ruins are ahead.',
        durationMs: 3500,
      });
    }
  }

  private onLyraRuinsEntryComplete(): void {
    if (Progression.merchantTrusted) {
      if (!Progression.battleTutorialDone) {
        this.openDialogueByKey('merchant-ruins-guide', undefined, () => {
          if (!Progression.hasWeapon) {
            Progression.hasWeapon = true;
            Progression.addItem('merchant-dagger', "Merchant's Dagger");
            QuestSystem.reportFlag('hasWeapon');
            EventBus.emit(EV.TOAST, { text: "Merchant's Dagger acquired" });
          }
          this.startBattleTutorial();
        });
      } else {
        this.wavesEnabled = true;
      }
      return;
    }

    if (!Progression.hasWeapon && !Progression.battleTutorialDone) {
      this.setupPreTutorialAmbush();
      return;
    }

    if (!Progression.battleTutorialDone) {
      this.openDialogueByKey('elder-ruins-guide', undefined, () => {
        this.startBattleTutorial();
      });
      return;
    }

    this.wavesEnabled = true;
  }

  private onRuinsReEntry(): void {
    if (!Progression.battleTutorialDone) {
      if (Progression.hasWeapon) {
        if (!Progression.merchantTrusted) {
          this.openDialogueByKey('elder-ruins-guide', undefined, () => this.startBattleTutorial());
        } else {
          this.startBattleTutorial();
        }
      } else {
        this.setupPreTutorialAmbush();
      }
    } else {
      this.wavesEnabled = true;
    }
  }

  private setupPreTutorialAmbush(): void {
    this.wavesEnabled = false;
    this.preTutorialAmbush = true;
    this.spawnEnemy('void-stalker', 500);
    EventBus.emit(EV.HINT, { text: 'Something moves in the fog ahead...', durationMs: 3000 });
  }

  private fleeFromRuins(): void {
    Progression.fledFromRuins = true;
    Progression.merchantGone = true;

    const thought: DialogueLine[] = [
      { speaker: 'Blade', text: 'The Stalker... it is too fast. I cannot fight it bare-handed.', color: '#ffd870' },
      { speaker: 'Blade', text: 'I have to get out of here. Back to the village.', color: '#ffd870' },
    ];
    this.activeDialogueKey = null;
    this.launchDialogue(thought, undefined, () => {
      this.showTransition(() => {
        Progression.currentLevel = 'village';
        Progression.spawnAt = { x: 1420, y: 280 };
      }, 'You flee back to Aethelgard...');
    });
  }

  // ----------------------------------------------------------
  // Dialogue plumbing
  // ----------------------------------------------------------

  private onDialogueStart(): void {
    this.dialogueActive = true;
    if (this.inputMgr) this.inputMgr.blocked = true;
    if (this.player?.body) this.player.body.setVelocity(0, 0);
    this.focusCameraForDialogue();
  }

  private onDialogueEndGlobal(): void {
    const key = this.activeDialogueKey;
    const cb = this.activeDialogueCallback;

    // Defer to allow DialogueScene.close() to complete its scene.stop()
    this.time.delayedCall(30, () => {
      this.dialogueActive = false;
      if (this.inputMgr) this.inputMgr.blocked = false;
      this.unfocusCamera();

      this.activeDialogueKey = null;
      this.activeDialogueCallback = null;

      if (cb) cb();
      if (!key) return;

      switch (key) {
        case 'girl-first':
          QuestSystem.start(GIRL_QUEST_ID);
          break;

        case 'miller-first':
          QuestSystem.reportTalk('miller');
          break;

        case 'blacksmith-quest':
          if (!Progression.hasWeapon) {
            Progression.hasWeapon = true;
            Progression.addItem('iron-dagger', 'Iron Dagger');
            QuestSystem.reportFlag('hasWeapon');
            EventBus.emit(EV.TOAST, { text: 'Iron Dagger acquired' });
          }
          break;

        case 'blacksmith-exchange-trust':
        case 'blacksmith-exchange-nontrust': {
          this.time.delayedCall(150, () => {
            const bs = this.npcs.find(n => n.def.id === 'blacksmith');
            if (bs) this.enterExchangeMode(bs.x, bs.y);
          });
          break;
        }

        case 'girl-thanks':
          QuestSystem.reportTalk('girl');
          Progression.removeItem('locket-of-elric', 1);
          if (!Progression.hasShardOfResonance) {
            Progression.hasShardOfResonance = true;
            Progression.addItem('shard-of-resonance', 'Shard of Resonance');
            EventBus.emit(EV.TOAST, { text: 'Shard of Resonance obtained!' });
          }
          break;

        case 'merchant-first':
          Progression.seenMerchantIntro = true;
          if (Progression.merchantTrusted && !Progression.merchantAccepted) {
            Progression.merchantAccepted = true;
            QuestSystem.upgrade('dying-world', 'dying-world-trust');
            QuestSystem.reportFlag('merchantAccepted');
          }
          break;
      }
    });
  }

  private openDialogueByKey(key: string, npcX?: number, onComplete?: () => void): void {
    const lines = DIALOGUES[key];
    if (!lines) return;
    this.activeDialogueKey = key;
    this.launchDialogue(lines, npcX, onComplete);
  }

  private launchDialogue(lines: DialogueLine[], npcX?: number, onComplete?: () => void): void {
    if (this.dialogueActive || this.exchangeActive) return;
    this.dialogueTargetX = npcX ?? 0;
    this.activeDialogueCallback = onComplete ?? null;
    this.scene.launch(SCENES.DIALOGUE, { lines });
  }

  // ----------------------------------------------------------
  // Camera focus
  // ----------------------------------------------------------

  private focusCameraForDialogue(): void {
    const cam = this.cameras.main;
    cam.stopFollow();
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2 + 50;
    const midX = this.dialogueTargetX > 0 ? (px + this.dialogueTargetX) / 2 : px;
    cam.zoomTo(DIALOGUE_ZOOM, 350, 'Sine.easeOut');
    cam.pan(midX, py, 350, 'Sine.easeOut');
  }

  private unfocusCamera(): void {
    const cam = this.cameras.main;
    cam.zoomTo(1, 300, 'Sine.easeIn');
    this.time.delayedCall(300, () => {
      if (!this.dialogueActive && !this.exchangeActive && this.player?.active) {
        cam.startFollow(this.player, true, 0.13, 0.09);
      }
    });
  }

  // ----------------------------------------------------------
  // Exchange mode
  // ----------------------------------------------------------

  private enterExchangeMode(bsX: number, bsY: number): void {
    if (this.exchangeActive) return;
    this.exchangeActive = true;
    if (this.inputMgr) this.inputMgr.blocked = true;
    if (this.player?.body) this.player.body.setVelocity(0, 0);

    const cam = this.cameras.main;
    cam.stopFollow();
    cam.zoomTo(EXCHANGE_ZOOM, 400, 'Sine.easeOut');
    cam.pan(bsX + 100, bsY - 40, 400, 'Sine.easeOut');

    EventBus.emit(EV.EXCHANGE_START);
  }

  private onExchangeEnd(): void {
    if (!this.exchangeActive) return;
    this.exchangeActive = false;
    if (this.inputMgr) this.inputMgr.blocked = false;

    Progression.exchangeUnlocked = true;
    QuestSystem.reportFlag('exchangeUnlocked');

    const cam = this.cameras.main;
    cam.zoomTo(1, 300, 'Sine.easeIn');
    this.time.delayedCall(300, () => {
      if (!this.dialogueActive && !this.exchangeActive && this.player?.active) {
        cam.startFollow(this.player, true, 0.13, 0.09);
      }
    });
  }

  // ----------------------------------------------------------
  // Tutorials
  // ----------------------------------------------------------

  private grantBackpack(): void {
    if (Progression.hasBackpack) return;
    Progression.hasBackpack = true;
    Progression.addItem('traveler-backpack', "Traveler's Backpack");
    QuestSystem.reportFlag('hasBackpack');
    EventBus.emit(EV.TOAST, { text: "Traveler's Backpack acquired" });
    this.startBackpackTutorial();
  }

  private startBattleTutorial(): void {
    this.wavesEnabled = false;
    this.tutorialKills = 0;
    this.tutorialEnemyLive = false;
    this.dashEnabledInternal = false;
    this.preTutorialAmbush = false;

    EventBus.off(EV.TUTORIAL_STEP, this.onTutorialStep, this);
    EventBus.off(EV.TUTORIAL_END, this.onBattleTutorialEnd, this);

    this.tutorial.start([
      { id: 'move',    text: 'Press A / D to move',                                      isComplete: c => c.moved },
      { id: 'jump',    text: 'Press W to jump. Press W again in mid-air to double-jump.', isComplete: c => c.jumped },
      { id: 'dash',    text: 'Press J to dash. Dashing is invincible and damages enemies.', isComplete: c => c.dashed },
      { id: 'special', text: 'Press K when SP is full to unleash Grand Sweep.',           isComplete: c => c.specialUsed },
      { id: 'kill',    text: 'Defeat 3 Void Stalkers',                                    isComplete: c => c.kills >= 3 },
    ]);

    EventBus.on(EV.TUTORIAL_STEP, this.onTutorialStep, this);
    EventBus.on(EV.TUTORIAL_END, this.onBattleTutorialEnd, this);
  }

  private onTutorialStep(payload: { stepId: string }): void {
    if (payload.stepId === 'dash' || payload.stepId === 'special' || payload.stepId === 'kill') {
      this.dashEnabledInternal = true;
    }
    if (payload.stepId === 'kill' && !this.tutorialEnemyLive) this.spawnTutorialStalker();
  }

  private onBattleTutorialEnd(): void {
    EventBus.off(EV.TUTORIAL_STEP, this.onTutorialStep, this);
    EventBus.off(EV.TUTORIAL_END, this.onBattleTutorialEnd, this);
    Progression.battleTutorialDone = true;
    QuestSystem.reportFlag('battleTutorialDone');
    this.dashEnabledInternal = true;
    this.wavesEnabled = true;
    this.tutorialEnemyLive = false;

    if (Progression.merchantTrusted) Progression.merchantGone = true;

    EventBus.emit(EV.HINT, { text: 'Tutorial complete. The ruins stretch ahead.', durationMs: 3500 });
  }

  private spawnTutorialStalker(): void {
    if (this.tutorialEnemyLive) return;
    this.tutorialEnemyLive = true;
    const x = Math.min(this.level.width - 100, this.player.x + 220);
    this.spawnEnemy('void-stalker', x);
  }

  private startBackpackTutorial(): void {
    if (Progression.backpackTutorialDone) return;
    EventBus.off(EV.TUTORIAL_END, this.onBackpackTutorialEnd, this);
    this.tutorial.start([
      { id: 'open', text: 'Backpack acquired! Press I to open your backpack.', isComplete: c => c.openedBackpack },
    ]);
    EventBus.on(EV.TUTORIAL_END, this.onBackpackTutorialEnd, this);
  }

  private onBackpackTutorialEnd(): void {
    EventBus.off(EV.TUTORIAL_END, this.onBackpackTutorialEnd, this);
    Progression.backpackTutorialDone = true;
  }

  // ----------------------------------------------------------
  // Locket
  // ----------------------------------------------------------

  private maybeRespawnLocket(): void {
    if (!QuestSystem.isActive(GIRL_QUEST_ID)) return;
    if (Progression.dollsEchoLocketCollected) return;
    const step = QuestSystem.getCurrentStep(GIRL_QUEST_ID);
    if (step?.type !== 'collect') return;
    if (this.locketExistsInWorld()) return;
    this.spawnQuestPickup(LOCKET_ITEM_ID, 'Locket of Elric', 200, 250);
    EventBus.emit(EV.TOAST, { text: 'A faint glint near the ruins entrance...' });
  }

  private locketExistsInWorld(): boolean {
    return this.pickups.some(p => p.itemId === LOCKET_ITEM_ID && !p.taken);
  }

  // ----------------------------------------------------------
  // Terrain / spawn / combat (same as Phase 5)
  // ----------------------------------------------------------

  private buildTerrain(): void {
    this.platformGroup = this.physics.add.staticGroup();

    this.add.tileSprite(0, this.level.groundY, this.level.width, 120, 'ground')
      .setOrigin(0, 0).setDepth(DEPTH.TERRAIN);

    const zone = this.add.zone(0, this.level.groundY, this.level.width, 120).setOrigin(0, 0);
    this.platformGroup.add(zone);
    this.platformRects.push(new Phaser.Geom.Rectangle(0, this.level.groundY, this.level.width, 120));

    for (const p of this.level.platforms) {
      if (p.ground) continue;
      this.add.tileSprite(p.x, p.y, p.w, p.h, 'platform').setOrigin(0, 0).setDepth(DEPTH.TERRAIN + 1);
      const z = this.add.zone(p.x, p.y, p.w, p.h).setOrigin(0, 0);
      this.platformGroup.add(z);
      this.platformRects.push(new Phaser.Geom.Rectangle(p.x, p.y, p.w, p.h));
    }

    if (this.level.id === 'house') {
      this.add.image(this.level.goal.x, this.level.goal.y, 'door')
        .setOrigin(0, 0).setDepth(DEPTH.TERRAIN + 2);
    }

    this.enemyGroup = this.physics.add.group();
    this.physics.add.collider(this.enemyGroup, this.platformGroup);
  }

  spawnEnemy(type: EnemyType, x: number, y?: number): void {
    const enemy = createEnemy(this, type, x, y);
    this.enemies.push(enemy);
    if (enemy.def.ai === 'walker') this.enemyGroup.add(enemy);
  }

  spawnProjectile(x: number, y: number, vx: number, vy: number, dmg: number): void {
    this.projectiles.push(new Projectile(this, x, y, vx, vy, dmg));
  }

  damageEnemy(enemy: Enemy, dmg: number): void {
    if (enemy.dead) return;
    enemy.hp -= dmg;
    enemy.flash();

    if (enemy.hp <= 0) {
      enemy.dead = true;
      this.player.kills++;
      this.player.xp += enemy.def.xp;
      const cx = enemy.x + enemy.width / 2;
      const cy = enemy.y + enemy.height / 2;
      this.fx.death(cx, cy, enemy.def.color);
      this.shake(5);
      this.addHitStop(40);
      this.rollDrops(enemy, cx, cy);
      enemy.destroy();
      this.enemies = this.enemies.filter(e => e !== enemy);
      this.handleEnemyKill(enemy.def.type, cx, cy);
    } else {
      this.fx.hitSpark(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
      this.shake(1.8);
      this.addHitStop(20);
    }
    this.emitStats();
  }

  private handleEnemyKill(type: string, x: number, y: number): void {
    if (this.tutorial.isActive) {
      this.tutorial.onKill();
      if (type === 'void-stalker' && this.tutorialEnemyLive) {
        this.tutorialKills++;
        this.tutorialEnemyLive = false;
        if (this.tutorialKills < 3) {
          this.time.delayedCall(700, () => {
            if (this.tutorial.isActive) this.spawnTutorialStalker();
          });
        }
      }
    }

    if (type === 'void-stalker' && QuestSystem.isActive(GIRL_QUEST_ID)) {
      Progression.dollsEchoKills++;
      QuestSystem.reportKill('void-stalker');
      const step = QuestSystem.getCurrentStep(GIRL_QUEST_ID);
      if (step?.type === 'collect' &&
          !Progression.dollsEchoLocketCollected &&
          !this.locketExistsInWorld()) {
        this.spawnQuestPickup(LOCKET_ITEM_ID, 'Locket of Elric', x + 20, y - 10);
        EventBus.emit(EV.TOAST, { text: 'Something glints in the dark...' });
      }
    }
  }

  private rollDrops(enemy: Enemy, x: number, y: number): void {
    if (!enemy.def.drops) return;
    for (const drop of enemy.def.drops) {
      if (Math.random() >= drop.chance) continue;
      const qty = drop.qtyMin + Math.floor(Math.random() * (drop.qtyMax - drop.qtyMin + 1));
      this.pickups.push(new Pickup(
        this,
        { x: x - 7 + Math.random() * 14, y: y - 10 - Math.random() * 20,
          kind: 'item', itemId: drop.id, itemName: drop.name },
        qty,
      ));
    }
  }

  private spawnQuestPickup(itemId: string, itemName: string, x: number, y: number): void {
    this.pickups.push(new Pickup(this, { x, y, kind: 'quest', itemId, itemName }, 1));
    this.fx.burst(x + 7, y + 7, 20, {
      speed: 60, speedVar: 120, lifeMs: 500, color: 0xd0b0ff, gravity: 60,
    });
  }

  addHitStop(ms: number): void { this.hitStopMs = Math.max(this.hitStopMs, ms); }
  shake(amount: number): void { this.cameras.main.shake(120, amount * 0.002); }

  onPlayerHurt(): void {
    this.shake(9);
    this.addHitStop(60);
    this.cameras.main.flash(120, 255, 40, 60, false);
    this.emitStats();
    if (this.preTutorialAmbush) {
      this.preTutorialAmbush = false;
      this.fleeFromRuins();
    }
  }

  onPlayerDeath(): void {
    if (this.isOver) return;
    this.isOver = true;
    this.shake(14);
    this.fx.burst(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      40, { speed: 120, speedVar: 300, lifeMs: 800, color: 0xff6070, gravity: 250 },
    );
    this.player.setVisible(false);
    this.endRun(false);
  }

  private endRun(win: boolean): void {
    this.time.delayedCall(500, () => {
      EventBus.emit(EV.RUN_ENDED, {
        win, timeSec: this.elapsedMs / 1000,
        kills: this.player.kills, xp: this.player.xp,
        rank: computeRank(this.player.kills, this.player.xp),
        message: win ? this.level.endMessage : undefined,
      });
    });
  }

  private emitStats(): void {
    const stats: PlayerStatsPayload = {
      hp: this.player.hp, maxHp: this.player.maxHp,
      special: this.player.special, specialReady: this.player.specialReady,
      xp: this.player.xp, kills: this.player.kills,
    };
    const p = this.lastStats;
    if (p && p.hp === stats.hp && p.special === stats.special &&
        p.xp === stats.xp && p.kills === stats.kills) return;
    this.lastStats = stats;
    EventBus.emit(EV.PLAYER_STATS, stats);
  }

  // ----------------------------------------------------------
  // Update
  // ----------------------------------------------------------

  override update(_time: number, delta: number): void {
    const dtMs = Math.min(delta, 50);
    this.inputMgr.update();
    if (this.sealedCooldownMs > 0) this.sealedCooldownMs -= dtMs;

    if (this.transitioning) {
      this.fx.update(dtMs);
      return;
    }

    if (this.isOver) {
      if (this.inputMgr.justPressed('restart') || this.inputMgr.justPressed('confirm')) {
        this.scene.restart();
      }
      this.fx.update(dtMs);
      return;
    }

    if (this.dialogueActive || this.exchangeActive) {
      const cam = this.cameras.main;
      this.background.update(cam.scrollX, cam.scrollY);
      this.fx.update(dtMs);
      return;
    }

    if (this.hitStopMs > 0) { this.hitStopMs -= dtMs; return; }

    this.elapsedMs += dtMs;

    this.player.update(dtMs, this.inputMgr);
    this.updateEnemies(dtMs);
    this.updateProjectiles(dtMs);
    this.updatePickups(dtMs);
    this.updateNpcs();

    if (this.tutorial.isActive) {
      this.tutorial.update({
        moved: this.inputMgr.isDown('left') || this.inputMgr.isDown('right'),
        jumped: this.inputMgr.justPressed('jump'),
        dashed: this.inputMgr.justPressed('dash'),
        specialUsed: this.inputMgr.justPressed('special'),
        openedBackpack: this.inputMgr.justPressed('backpack'),
      });
    }

    if (this.wavesEnabled && this.level.combatEnabled) this.waves.update(this.player.x);
    this.fx.update(dtMs);
    this.updateSpecialGfx();

    const cam = this.cameras.main;
    this.background.update(cam.scrollX, cam.scrollY);
    this.checkNpcAutoTrigger();

    if (this.returnPortal &&
        Phaser.Geom.Intersects.RectangleToRectangle(this.player.bounds, this.returnPortal.bounds)) {
      this.transitionTo(this.level.returnPortal!.destination, 'backward');
      return;
    }
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.bounds, this.portal.bounds)) {
      if (this.level.next) this.transitionTo(this.level.next, 'forward');
      else this.showSealedMessage();
    }

    this.emitStats();
  }

  private transitionTo(nextLevelId: string, direction: 'forward' | 'backward'): void {
    if (this.isOver) return;
    this.isOver = true;

    const destName = LEVELS[nextLevelId]?.name ?? nextLevelId;
    const verb = direction === 'backward' ? 'back to' : 'on to';

    this.showTransition(() => {
      Progression.currentLevel = nextLevelId;
      if (direction === 'backward') {
        const dest = LEVELS[nextLevelId];
        Progression.spawnAt = { x: dest.goal.x - 80, y: dest.goal.y + 40 };
      } else {
        Progression.spawnAt = null;
      }
    }, `You travel ${verb} ${destName}...`);
  }

  private showTransition(finish: () => void, message: string): void {
    if (this.transitioning) return;
    this.transitioning = true;

    const black = this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 1)
      .setOrigin(0, 0).setDepth(9998).setScrollFactor(0).setAlpha(0);
    this.tweens.add({ targets: black, alpha: 1, duration: 400 });

    const text = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, message, {
        fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: '#e0d8f8',
        align: 'center',
      })
      .setOrigin(0.5).setDepth(9999).setScrollFactor(0).setAlpha(0);
    this.tweens.add({ targets: text, alpha: 1, duration: 400, delay: 250 });

    this.time.delayedCall(1400, () => {
      finish();
      this.scene.restart();
    });
  }

  private showSealedMessage(): void {
    if (this.sealedCooldownMs > 0) return;
    EventBus.emit(EV.TOAST, { text: 'This path is sealed.' });
    this.sealedCooldownMs = 1500;
    this.player.body.velocity.x = -200;
  }

  private checkNpcAutoTrigger(): void {
    if (this.dialogueActive || this.exchangeActive || this.activeDialogueKey) return;

    // Elder auto-warn at village exit
    for (const npc of this.npcs) {
      const triggerX = npc.def.autoTriggerX;
      if (triggerX === undefined) continue;
      if (npc.def.id === 'elder' && !Progression.elderWarned && this.player.x >= triggerX) {
        Progression.elderWarned = true;
        npc.interactable = true;
        this.openDialogueByKey('elder-warn', npc.x);
        return;
      }
    }

    // Merchant gone — inner thought + return to village
    if (this.level.id === 'path' &&
        Progression.merchantTrusted &&
        Progression.battleTutorialDone &&
        !Progression.seenMerchantGone &&
        this.player.x >= 300) {
      Progression.seenMerchantGone = true;
      QuestSystem.reportFlag('seenMerchantGone');
      this.openDialogueByKey('merchant-gone-thought', undefined, () => {
        this.showTransition(() => {
          Progression.currentLevel = 'village';
          Progression.spawnAt = { x: 1660, y: 280 };
        }, 'You return to Aethelgard Village...');
      });
      return;
    }
  }

  private updateNpcs(): void {
    for (const npc of this.npcs) npc.update(this.player);
    if (!this.inputMgr.justPressed('interact')) return;

    for (const npc of this.npcs) {
      if (!npc.isInRange(this.player)) continue;
      if (!npc.interactable) continue;
      if (npc.def.id === 'elder' && !Progression.elderWarned) continue;

      if (npc.def.id === 'blacksmith' && Progression.exchangeUnlocked) {
        this.enterExchangeMode(npc.x, npc.y);
        break;
      }

      const key = this.getNpcDialogueKey(npc.def.id);
      if (key) this.openDialogueByKey(key, npc.x);
      break;
    }
  }

  private getNpcDialogueKey(npcId: string): string | null {
    if (npcId === 'elder') {
      if (!Progression.elderWarned) return null;
      if (Progression.elderGaveBackpack) return 'elder-repeat';
      if (Progression.battleTutorialDone) {
        return Progression.merchantTrusted ? 'elder-amazed' : 'elder-backpack';
      }
      if (Progression.elderSentToBlacksmith) return 'elder-repeat';
      if (Progression.fledFromRuins && !Progression.hasWeapon) return 'elder-send';
      return 'elder-warn';  // repeat warning before flee
    }

    if (npcId === 'girl') { /* unchanged */ }

    if (npcId === 'blacksmith') {
      if (Progression.exchangeUnlocked) return null;  // handled in updateNpcs
      const step = QuestSystem.getCurrentStep('dying-world-trust')
                ?? QuestSystem.getCurrentStep('dying-world');
      const onExchangeStep = step?.type === 'flag' && step.target === 'exchangeUnlocked';
      if (onExchangeStep) {
        return Progression.merchantTrusted ? 'blacksmith-exchange-trust' : 'blacksmith-exchange-nontrust';
      }
      if (!Progression.hasWeapon && Progression.elderSentToBlacksmith && !Progression.merchantTrusted) {
        return 'blacksmith-quest';
      }
      if (Progression.hasWeapon) return 'blacksmith-repeat';
      return 'blacksmith-first';
    }

    if (npcId === 'miller') return 'miller-first';
    if (npcId === 'merchant') {
      return Progression.seenMerchantIntro ? 'merchant-repeat' : 'merchant-first';
    }
    return null;
  }

  private updateEnemies(dtMs: number): void {
    const pb = this.player.bounds;
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.update(dtMs, this.player);
      if (!this.player.isInvulnerable &&
          Phaser.Geom.Intersects.RectangleToRectangle(e.bounds, pb)) {
        this.player.hurt(e.def.dmg, e.x + e.width / 2);
      }
    }
  }

  private updateProjectiles(dtMs: number): void {
    const pb = this.player.bounds;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.update(dtMs);
      let gone = pr.lifeMs <= 0 || pr.x < -60 || pr.x > this.level.width + 60 || pr.y > this.level.groundY + 60;
      if (!gone) for (const r of this.platformRects) {
        if (Phaser.Geom.Rectangle.Contains(r, pr.x, pr.y)) { gone = true; break; }
      }
      if (!gone && Phaser.Geom.Intersects.RectangleToRectangle(pr.bounds, pb)) {
        this.player.hurt(pr.dmg, pr.x);
        gone = true;
      }
      if (gone) {
        this.fx.burst(pr.x, pr.y, 5, { speed: 40, speedVar: 80, lifeMs: 200, color: 0xc090ff });
        pr.destroy();
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updatePickups(dtMs: number): void {
    const pb = this.player.bounds;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (pk.taken) continue;
      pk.update(dtMs);
      if (Phaser.Geom.Intersects.RectangleToRectangle(pk.bounds, pb)) {
        pk.taken = true;
        pk.setVisible(false);
        this.onPickupCollected(pk);
        this.pickups.splice(i, 1);
        this.emitStats();
      }
    }
  }

  private onPickupCollected(pk: Pickup): void {
    if (pk.kind === 'health') {
      this.player.heal(pk.amount);
      this.fx.burst(pk.x + 6, pk.y + 6, 16, { speed: 60, speedVar: 120, lifeMs: 380, color: 0x60ff90, gravity: 60 });
      return;
    }
    if (pk.kind === 'item') {
      if (pk.itemId && pk.itemName) Progression.addItem(pk.itemId, pk.itemName, pk.qty);
      EventBus.emit(EV.TOAST, { text: `${pk.itemName} x${pk.qty}` });
      return;
    }
    if (pk.kind === 'quest') {
      EventBus.emit(EV.TOAST, { text: `${pk.itemName} obtained!` });
      if (pk.itemId && pk.itemName) {
        Progression.addItem(pk.itemId, pk.itemName, 1);
        QuestSystem.reportCollect(pk.itemId);
        if (pk.itemId === LOCKET_ITEM_ID) Progression.dollsEchoLocketCollected = true;
      }
      return;
    }
    if (pk.kind === 'backpack') this.grantBackpack();
  }

  private updateSpecialGfx(): void {
    const g = this.specialGfx;
    g.clear();
    const p = this.player;
    if (p.specialMs <= 0) return;

    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;
    const prog = 1 - p.specialMs / PLAYER.SPECIAL_MS;
    const facingAngle = p.facing > 0 ? 0 : Math.PI;
    const halfArc = PLAYER.SPECIAL_ARC / 2;
    const startAngle = facingAngle - halfArc;
    const curAngle = startAngle + PLAYER.SPECIAL_ARC * Math.min(1, prog * 1.35);
    const fade = Math.max(0, 1 - prog * 0.55);

    g.fillStyle(0xb090ff, 0.2 * fade);
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, PLAYER.SPECIAL_RADIUS, startAngle, curAngle, false);
    g.closePath();
    g.fillPath();

    for (let a = startAngle; a <= curAngle; a += 0.055) {
      const r = 92 + Math.sin(a * 9 + this.elapsedMs * 0.02) * 7;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      g.fillStyle(0xd8c0ff, 0.85 * fade);
      g.fillRect(Math.round(px) - 1, Math.round(py) - 1, 3, 3);
    }
    void GAME_WIDTH; void GAME_HEIGHT;
  }
}