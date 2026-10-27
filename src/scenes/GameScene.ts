import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, ITEM_RULES, CAMERA, SCENES } from '../core/constants';
import { bindSteering } from '../core/input';
import { RunState } from '../core/RunState';
import { pickItem, type ItemDef } from '../items/itemDefs';

interface FallingItem {
  def: ItemDef;
  shape: Phaser.GameObjects.Rectangle;
}

// Placeholder outlines so item types read at a glance: gold points, green buff, red debuff.
const OUTLINE = { points: 0xf9a825, buff: 0x2e7d32, debuff: 0xb71c1c } as const;

const PLAYER_SIZE = 40;
const START_Y = GAME_HEIGHT - 200;

/**
 * Core loop with placeholder rectangles. Tap left/right to flap and drift,
 * gravity pulls down, the camera follows the climb, items fall from above.
 * Falling off the bottom of the screen ends the run.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private bg!: Phaser.GameObjects.TileSprite;
  private hud!: Phaser.GameObjects.Text;
  private status!: Phaser.GameObjects.Text;
  private run = new RunState();
  private items: FallingItem[] = [];
  private spawnTimerMs = 0;
  private vx = 0;
  private vy = 0;
  private startY = START_Y;
  private ended = false;

  constructor() {
    super(SCENES.game);
  }

  create(): void {
    this.run = new RunState();
    this.items = [];
    this.spawnTimerMs = 0;
    this.ended = false;
    this.vx = 0;
    this.vy = PHYSICS.flapVelocity;
    this.startY = START_Y;

    this.cameras.main.setScroll(0, 0);
    this.bg = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'bg')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-10);

    this.player = this.add.rectangle(GAME_WIDTH / 2, START_Y, PLAYER_SIZE, PLAYER_SIZE, 0xffb300).setDepth(5);

    this.hud = this.add
      .text(12, 10, '', { fontSize: '22px', color: '#5d4037' })
      .setScrollFactor(0)
      .setDepth(20);
    this.status = this.add
      .text(12, 40, '', { fontSize: '16px', color: '#8d6e63' })
      .setScrollFactor(0)
      .setDepth(20);

    bindSteering(this, (dir) => this.flap(dir));
  }

  private flap(dir: -1 | 1): void {
    if (this.ended || this.run.isStunned) return;
    const power = this.run.strongFlapMs > 0 ? this.run.strongFlapFactor : 1;
    this.vy = PHYSICS.flapVelocity * power;
    const steer = this.run.isDisoriented ? -dir : dir; // disoriented: left/right swapped
    this.vx = steer * PHYSICS.driftVelocity;
  }

  update(_time: number, deltaMs: number): void {
    if (this.ended) return;
    const dt = Math.min(deltaMs, 50) / 1000; // clamp so a tab switch can't teleport the player
    this.run.tick(dt * 1000);

    this.movePlayer(dt);
    this.updateCamera(dt);
    this.spawnItems(dt * 1000);
    this.updateItems(dt);
    this.updateHud();

    const cam = this.cameras.main;
    if (this.player.y > cam.scrollY + GAME_HEIGHT + PLAYER_SIZE) this.endRun();
  }

  private movePlayer(dt: number): void {
    if (this.run.pendingKnockback > 0) {
      this.vy = this.run.pendingKnockback;
      this.run.pendingKnockback = 0;
    }
    if (this.run.dashMs > 0) {
      this.vy = this.run.dashVelocity;
    } else {
      this.vy = Math.min(this.vy + PHYSICS.gravity * dt, PHYSICS.maxFallSpeed);
    }
    this.vx *= Math.pow(PHYSICS.horizontalDrag, dt * 60);

    // Side walls: the character bounces off the screen edges so it never sticks to them.
    const half = PLAYER_SIZE / 2;
    const nextX = this.player.x + this.vx * dt;
    this.player.x = Phaser.Math.Clamp(nextX, half, GAME_WIDTH - half);
    if (this.player.x !== nextX) this.vx = -this.vx * PHYSICS.wallBounce;
    this.player.y += this.vy * dt;
  }

  /**
   * Camera only ever moves up. It scrolls steadily (faster with height) and jumps
   * ahead if the player flies above the lead line, so the player can never outrun it.
   */
  private updateCamera(dt: number): void {
    const cam = this.cameras.main;
    const speed = Math.min(CAMERA.maxSpeed, CAMERA.baseSpeed + this.run.heightMeters * CAMERA.speedRamp);
    cam.scrollY = Math.min(cam.scrollY - speed * dt, this.player.y - CAMERA.leadPx);
    this.bg.tilePositionY = cam.scrollY;
    this.run.heightMeters = Math.max(this.run.heightMeters, (this.startY - this.player.y) / PHYSICS.pixelsPerMeter);
  }

  private spawnItems(dtMs: number): void {
    this.spawnTimerMs -= dtMs;
    if (this.spawnTimerMs > 0) return;
    const h = this.run.heightMeters;
    this.spawnTimerMs = Math.max(ITEM_RULES.minSpawnMs, ITEM_RULES.baseSpawnMs - h * ITEM_RULES.spawnRamp);

    const def = pickItem(h);
    const cam = this.cameras.main;
    const x = Phaser.Math.Between(30, GAME_WIDTH - 30);
    const shape = this.add
      .rectangle(x, cam.scrollY - 40, ITEM_RULES.size, ITEM_RULES.size, def.color)
      .setStrokeStyle(3, OUTLINE[def.kind])
      .setDepth(3);
    this.items.push({ def, shape });
  }

  private updateItems(dt: number): void {
    const cam = this.cameras.main;
    const fall = Math.min(ITEM_RULES.maxFallSpeed, ITEM_RULES.baseFallSpeed + this.run.heightMeters * ITEM_RULES.fallRamp);
    const reach = (PLAYER_SIZE + ITEM_RULES.size) / 2;

    for (const it of [...this.items]) {
      const s = it.shape;
      s.y += fall * dt;

      if (Math.abs(s.x - this.player.x) < reach && Math.abs(s.y - this.player.y) < reach) {
        this.run.collect(it.def);
        this.remove(it);
      } else if (s.y > cam.scrollY + GAME_HEIGHT + 60) {
        this.remove(it);
      }
    }
  }

  private remove(it: FallingItem): void {
    it.shape.destroy();
    this.items.splice(this.items.indexOf(it), 1);
  }

  private updateHud(): void {
    this.hud.setText(`${this.run.score}   (${Math.floor(this.run.heightMeters)} m)`);
    const bits: string[] = [];
    if (this.run.shield) bits.push('SHIELD');
    if (this.run.dashMs > 0) bits.push('DASH');
    if (this.run.isStunned) bits.push('STUNNED');
    if (this.run.strongFlapMs > 0) bits.push('POWER');
    if (this.run.isDisoriented) bits.push('DIZZY');
    if (this.run.doublePointsMs > 0) bits.push('x2');
    this.status.setText(bits.join('  '));
    this.player.setFillStyle(this.run.isStunned ? 0xb0bec5 : 0xffb300);
  }

  private endRun(): void {
    this.ended = true;
    this.scene.start(SCENES.receipt, { result: this.run.result() });
  }
}
