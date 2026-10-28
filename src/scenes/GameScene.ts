import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, ITEM_RULES, CAMERA, SCENES } from '../core/constants';
import { bindSteering } from '../core/input';
import { t } from '../i18n';
import { FONT } from '../ui/theme';
import { RunState } from '../core/RunState';
import { difficulty, ramp } from '../core/difficulty';
import { zoneAt, zoneBannerText, zoneTextureKey, ZONES, type Zone } from '../core/zones';
import { pickItem, type ItemDef } from '../items/itemDefs';
import { addItemSprite, itemDisplaySize } from '../items/itemSprite';

interface FallingItem {
  def: ItemDef;
  shape: Phaser.GameObjects.Image;
  /** Soft disc in the kind's color behind the sprite, so good and bad items read at a glance. */
  halo: Phaser.GameObjects.Arc;
  visualSize: number;
  baseX: number;
  swayPhase: number;
}

// Halo colors so item types read at a glance: gold points, green buff, red debuff.
const OUTLINE = { points: 0xf9a825, buff: 0x2e7d32, debuff: 0xb71c1c } as const;

const PLAYER_HITBOX_SIZE = 40;
const PLAYER_SPRITE_SIZE = 64;
/** Native 32x32 sprites are displayed at 48x48 with nearest-neighbour filtering for clarity. */
const ITEM_SPRITE_SIZE = 48;
const START_Y = GAME_HEIGHT - 200;
const VIMMY_FLY_ANIM = 'vimmy-fly';
const VIMMY_FLIP_ANIM = 'vimmy-helicopter-flip';
const BUFF_REACTION_TEXTURE: Readonly<Record<string, string>> = {
  oyster: 'vimmy-buff-oyster',
  lawyerSuit: 'vimmy-buff-lawyerSuit',
  handkerchief: 'vimmy-buff-handkerchief',
  rollingPin: 'vimmy-buff-rollingPin',
  helicopter: 'vimmy-buff-helicopter',
};

/**
 * Core loop with Vimmy's animated sprite. Tap left/right to flap and drift,
 * gravity pulls down, the camera follows the climb, items fall from above.
 * Falling off the bottom of the screen ends the run.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private bg!: Phaser.GameObjects.TileSprite;
  private zone: Zone = zoneAt(0);
  private banner!: Phaser.GameObjects.Text;
  private hud!: Phaser.GameObjects.Text;
  private status!: Phaser.GameObjects.Text;
  private run = new RunState();
  private items: FallingItem[] = [];
  private spawnTimerMs = 0;
  private vx = 0;
  private vy = 0;
  private startY = START_Y;
  private ended = false;
  private isFlipping = false;
  private reactionTimer?: Phaser.Time.TimerEvent;

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
    this.isFlipping = false;
    this.reactionTimer = undefined;
    // Dev only: open http://localhost:5173/?zone=courtroom to start the run inside a zone.
    const devZone = import.meta.env.DEV ? ZONES.find((z) => z.id === new URLSearchParams(location.search).get('zone')) : undefined;
    if (devZone) {
      this.startY = START_Y + devZone.fromMeters * PHYSICS.pixelsPerMeter;
      this.run.heightMeters = devZone.fromMeters;
    }
    this.zone = zoneAt(this.run.heightMeters);

    this.cameras.main.setScroll(0, 0);
    this.bg = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, zoneTextureKey(this.zone))
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-10);

    this.createVimmyAnimations();
    this.player = this.add.sprite(GAME_WIDTH / 2, START_Y, 'vimmy-fly-0').setDisplaySize(PLAYER_SPRITE_SIZE, PLAYER_SPRITE_SIZE).setDepth(5);
    this.player.play(VIMMY_FLY_ANIM);

    this.hud = this.add
      .text(12, 10, '', { fontFamily: FONT.family, fontSize: '22px', color: '#5d4037' })
      .setScrollFactor(0)
      .setDepth(20);
    this.status = this.add
      .text(12, 40, '', { fontFamily: FONT.family, fontSize: '16px', color: '#8d6e63' })
      .setScrollFactor(0)
      .setDepth(20);

    this.banner = this.add
      .text(GAME_WIDTH / 2, 120, '', { fontFamily: FONT.family, fontSize: '26px', align: 'center', color: '#4e342e', backgroundColor: '#ffffffcc', padding: { x: 14, y: 8 } })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(25)
      .setAlpha(0);
    this.showBanner(zoneBannerText(this.zone));

    bindSteering(this, (dir) => this.flap(dir));
  }

  private showBanner(text: string): void {
    this.tweens.killTweensOf(this.banner);
    this.banner.setText(text).setAlpha(1);
    this.tweens.add({ targets: this.banner, alpha: 0, delay: 1400, duration: 600 });
  }

  private createVimmyAnimations(): void {
    if (!this.anims.exists(VIMMY_FLY_ANIM)) {
      this.anims.create({
        key: VIMMY_FLY_ANIM,
        frames: [0, 1, 2, 3].map((i) => ({ key: `vimmy-fly-${i}` })),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!this.anims.exists(VIMMY_FLIP_ANIM)) {
      this.anims.create({
        key: VIMMY_FLIP_ANIM,
        frames: [0, 1, 2, 3].map((i) => ({ key: `vimmy-flip-${i}` })),
        frameRate: 10,
        repeat: 0,
      });
    }
  }

  /** Contacting the helicopter plays one backward tumble, then returns to normal flight. */
  private playHelicopterFlip(): void {
    if (this.isFlipping) return;
    this.isFlipping = true;
    this.player.play(VIMMY_FLIP_ANIM, true);
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation: Phaser.Animations.Animation) => {
      if (animation.key !== VIMMY_FLIP_ANIM || !this.player.active) return;
      this.isFlipping = false;
      this.player.play(VIMMY_FLY_ANIM);
    });
  }

  /** Briefly turn Vimmy toward the player when she collects one of the five buffs. */
  private playBuffReaction(item: ItemDef): void {
    const texture = BUFF_REACTION_TEXTURE[item.id];
    if (!texture || this.isFlipping) return;

    this.reactionTimer?.remove(false);
    this.player.stop().setTexture(texture);
    this.reactionTimer = this.time.delayedCall(item.id === 'helicopter' ? 280 : 560, () => {
      this.reactionTimer = undefined;
      if (!this.player.active || this.ended) return;
      if (item.id === 'helicopter') this.playHelicopterFlip();
      else this.player.play(VIMMY_FLY_ANIM);
    });
  }

  /** Swap the backdrop and announce the zone when the dog climbs past a milestone. */
  private updateZone(): void {
    const zone = zoneAt(this.run.heightMeters);
    if (zone.id === this.zone.id) return;
    const previous = this.zone;
    this.zone = zone;
    this.bg.setTexture(zoneTextureKey(zone));
    this.showBanner(zoneBannerText(zone, previous));
  }

  private flap(dir: -1 | 1): void {
    if (this.ended || this.run.isStunned) return;
    const power = this.run.strongFlapMs > 0 ? this.run.strongFlapFactor : 1;
    const slow = this.run.slowMs > 0 ? this.run.slowFactor : 1; // fish sauce bread: slower flaps and drift
    this.vy = PHYSICS.flapVelocity * power * slow;
    const steer = this.run.isDisoriented ? -dir : dir; // disoriented: left/right swapped
    this.vx = steer * PHYSICS.driftVelocity * slow;
  }

  update(_time: number, deltaMs: number): void {
    if (this.ended) return;
    const dt = Math.min(deltaMs, 50) / 1000; // clamp so a tab switch can't teleport the player
    this.run.tick(dt * 1000);

    this.movePlayer(dt);
    this.updateCamera(dt);
    this.updateZone();
    this.spawnItems(dt * 1000);
    this.updateItems(dt);
    this.updateHud();

    const cam = this.cameras.main;
    if (this.player.y > cam.scrollY + GAME_HEIGHT + PLAYER_SPRITE_SIZE) this.endRun();
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

    // Side walls: bounce away and stagger briefly, so hugging a wall is never a free path up.
    const half = PLAYER_SPRITE_SIZE / 2;
    const nextX = this.player.x + this.vx * dt;
    this.player.x = Phaser.Math.Clamp(nextX, half, GAME_WIDTH - half);
    if (this.player.x !== nextX) {
      const away = nextX < half ? 1 : -1;
      this.vx = away * Math.max(PHYSICS.wallKick, Math.abs(this.vx) * PHYSICS.wallBounce);
      this.run.stun(PHYSICS.wallStunMs);
    }
    this.player.y += this.vy * dt;
  }

  /**
   * Camera only ever moves up. It scrolls steadily (faster with height) and jumps
   * ahead if the player flies above the lead line, so the player can never outrun it.
   */
  private updateCamera(dt: number): void {
    const cam = this.cameras.main;
    const speed = ramp(CAMERA.speed, difficulty(this.run.heightMeters));
    cam.scrollY = Math.min(cam.scrollY - speed * dt, this.player.y - CAMERA.leadPx);
    this.bg.tilePositionY = cam.scrollY;
    this.run.heightMeters = Math.max(this.run.heightMeters, (this.startY - this.player.y) / PHYSICS.pixelsPerMeter);
  }

  private spawnItems(dtMs: number): void {
    this.spawnTimerMs -= dtMs;
    if (this.spawnTimerMs > 0) return;
    const h = this.run.heightMeters;
    const d = difficulty(h);
    this.spawnTimerMs = ramp(ITEM_RULES.spawnMs, d);

    this.spawnOne(h, 0);
    if (Math.random() < ramp(ITEM_RULES.doubleSpawnChance, d)) this.spawnOne(h, 1);
  }

  private spawnOne(heightMeters: number, row: number): void {
    const def = pickItem(heightMeters);
    const cam = this.cameras.main;
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const y = cam.scrollY - 40 - row * 70;
    const visualSize = itemDisplaySize(def.id, ITEM_SPRITE_SIZE);
    const halo = this.add.circle(x, y, visualSize * 0.55, OUTLINE[def.kind], 0.35).setStrokeStyle(2, OUTLINE[def.kind], 0.8).setDepth(2.9);
    const shape = addItemSprite(this, x, y, def, visualSize).setDepth(3);
    this.items.push({ def, shape, halo, visualSize, baseX: x, swayPhase: Math.random() * Math.PI * 2 });
  }

  private updateItems(dt: number): void {
    const cam = this.cameras.main;
    const d = difficulty(this.run.heightMeters);
    const fall = ramp(ITEM_RULES.fallSpeed, d);
    const sway = ramp(ITEM_RULES.debuffSway, d);

    for (const it of [...this.items]) {
      const s = it.shape;
      s.y += fall * dt;
      if (it.def.kind === 'debuff' && sway > 0) {
        // Debuffs swerve, harder to dodge the higher you climb. Kept inside the walls.
        const wobble = Math.sin(this.time.now / 1000 * ITEM_RULES.swayRate + it.swayPhase) * sway;
        s.x = Phaser.Math.Clamp(it.baseX + wobble, ITEM_RULES.size / 2, GAME_WIDTH - ITEM_RULES.size / 2);
      }

      it.halo.setPosition(s.x, s.y);

      const reach = (PLAYER_HITBOX_SIZE + Math.max(ITEM_RULES.size, it.visualSize * 0.75)) / 2;
      if (Math.abs(s.x - this.player.x) < reach && Math.abs(s.y - this.player.y) < reach) {
        if (it.def.kind === 'buff') this.playBuffReaction(it.def);
        this.run.collect(it.def);
        this.remove(it);
      } else if (s.y > cam.scrollY + GAME_HEIGHT + 60) {
        this.remove(it);
      }
    }
  }

  private remove(it: FallingItem): void {
    it.shape.destroy();
    it.halo.destroy();
    this.items.splice(this.items.indexOf(it), 1);
  }

  private updateHud(): void {
    this.hud.setText(`${this.run.score}   (${Math.floor(this.run.heightMeters)} m)`);
    const bits: string[] = [];
    if (this.run.shield) bits.push(t('hud.shield'));
    if (this.run.dashMs > 0) bits.push(t('hud.dash'));
    if (this.run.isStunned) bits.push(t('hud.stunned'));
    if (this.run.strongFlapMs > 0) bits.push(t('hud.power'));
    if (this.run.isDisoriented) bits.push(t('hud.dizzy'));
    if (this.run.slowMs > 0) bits.push(t('hud.slow'));
    if (this.run.doublePointsMs > 0) bits.push(t('hud.x2'));
    this.status.setText(bits.join('  '));
    if (this.run.isStunned) this.player.setTint(0xb0bec5);
    else this.player.clearTint();
  }

  private endRun(): void {
    this.ended = true;
    this.scene.start(SCENES.receipt, { result: { ...this.run.result(), zone: this.zone.id } });
  }
}
