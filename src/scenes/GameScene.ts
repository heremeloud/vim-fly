import { beginRun } from '../leaderboard/client';
import Phaser from 'phaser';
import { devFlag, devParam } from '../core/devTools';
import { itemSfx, loopSfx, playSfx } from '../audio/sfx';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, ITEM_RULES, CAMERA, SCENES } from '../core/constants';
import { bindSteering } from '../core/input';
import { itemName, t, tDynamic } from '../i18n';
import { COLORS, FONT } from '../ui/theme';
import { fitWidth } from '../ui/widgets';
import { RunState } from '../core/RunState';
import { difficulty, ramp } from '../core/difficulty';
import { FINALE_METERS, finaleAt } from '../core/finales';
import { zoneAt, zoneBannerText, zoneTextureKey, ZONES, type Zone } from '../core/zones';
import { getItem, pickItem, type ItemDef } from '../items/itemDefs';
import { addItemSprite, itemDisplaySize } from '../items/itemSprite';

interface FallingItem {
  def: ItemDef;
  shape: Phaser.GameObjects.Image;
  /** Soft disc in the kind's color behind the sprite, so good and bad items read at a glance. */
  halo?: Phaser.GameObjects.Arc; // admin only: circles each item
  visualSize: number;
  baseX: number;
  swayPhase: number;
}

// Halo colors so item types read at a glance: gold points, green buff, red debuff.
const OUTLINE = { points: 0xf9a825, buff: 0x2e7d32, debuff: 0xb71c1c } as const;

/** The backdrop is drawn this much past each screen edge so the blur has no bare fringe. */
const BG_BLEED = 32;
/** Backdrop blur at full effect (the helicopter, or the fastest climb): offsets in px, softened by a few steps. */
const BG_BLUR_MAX = { x: 2, y: 5 } as const;
/** Climb speed alone only blurs the backdrop up to this fraction of the full effect. */
const BG_BLUR_SPEED_SHARE = 0.5;
/** How quickly the blur follows its target (per second). Lower is smoother: about a second to settle. */
const BG_BLUR_EASE = 2;

const PLAYER_HITBOX_SIZE = 44;
const PLAYER_SPRITE_SIZE = 80;
/** Native 32x32 sprites are displayed at 48x48 with nearest-neighbour filtering for clarity. */
const ITEM_SPRITE_SIZE = 48;
/**
 * Dev only: open http://localhost:5173/?admin to test without losing. Vimmy bounces off the bottom of the
 * screen instead of falling out, and debuffs pass through. Press N to jump to the next location and look through
 * every backdrop; `&zone=aquarium` starts the run at a given location.
 */
const ADMIN = devFlag('admin');
const BANNER_Y = 190; // below the HUD panel; small and see-through so it never hides the play area
const BANNER_ALPHA = 0.7;
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
const DASH_TEXTURE = { '-1': 'vimmy-dash-left', '1': 'vimmy-dash-right' } as const;
const DEBUFF_REACTION_TEXTURE: Readonly<Record<string, string>> = {
  cilantroBread: 'vimmy-debuff-queasy',
  fishSauceBread: 'vimmy-debuff-queasy',
  planner: 'vimmy-debuff-stunned',
  gavelHammer: 'vimmy-debuff-stunned',
  carCrash: 'vimmy-debuff-crash',
};

/**
 * Core loop with Vimmy's animated sprite. Tap left/right to flap and drift,
 * gravity pulls down, the camera follows the climb, items fall from above.
 * Falling off the bottom of the screen ends the run.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  /** Soft bubble around Vimmy while the lawyer-suit shield is up. */
  private shieldAura!: Phaser.GameObjects.Arc;
  private bg!: Phaser.GameObjects.TileSprite;
  /** The previous location's backdrop, fading out on top of `bg` after a zone change. */
  private bgFade: Phaser.GameObjects.TileSprite | null = null;
  /** 0 = sharp backdrop, 1 = fully blurred. Eases toward the target so the blur never pops. */
  private bgBlurLevel = 0;
  /** The location whose finale (its last stretch) is under way, so its banner shows only once per run. */
  private finaleZone: string | null = null;
  /** How many of the finale's guaranteed items have been dropped so far. */
  private finaleGiven = 0;
  private zone: Zone = zoneAt(0);
  private banner!: Phaser.GameObjects.Container;
  private bannerBg!: Phaser.GameObjects.Graphics;
  private bannerName!: Phaser.GameObjects.Text;
  private hudPanel!: Phaser.GameObjects.Graphics;
  private scoreText!: Phaser.GameObjects.Text;
  private metersText!: Phaser.GameObjects.Text;
  private lastScore = 0;
  private progressGfx!: Phaser.GameObjects.Graphics;
  private chipGfx!: Phaser.GameObjects.Graphics;
  private chipTexts: Phaser.GameObjects.Text[] = [];
  private dizzyOverlay!: Phaser.GameObjects.Rectangle;
  private dizzyStars: Phaser.GameObjects.Text[] = [];
  private run = new RunState();
  private items: FallingItem[] = [];
  private spawnTimerMs = 0;
  private vx = 0;
  private vy = 0;
  private startY = START_Y;
  private ended = false;
  private swipesLeft = PHYSICS.swipeDashesPerRun;
  /** Direction of the dash in progress (0 = none). While dashing Vimmy flies level and ignores debuffs. */
  private swipeDashDir: -1 | 0 | 1 = 0;
  private swipeBreads: Phaser.GameObjects.Image[] = [];
  private isFlipping = false;
  private reactionTimer?: Phaser.Time.TimerEvent;
  private buzz: Phaser.Sound.BaseSound | null = null;
  private copter: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super(SCENES.game);
  }

  create(): void {
    beginRun(); // asks the server for a run token in the background; the receipt submits the score with it
    this.run = new RunState();
    this.items = [];
    this.bgFade = null;
    this.bgBlurLevel = 0;
    this.finaleZone = null;
    this.finaleGiven = 0;
    this.spawnTimerMs = 0;
    this.ended = false;
    this.swipesLeft = PHYSICS.swipeDashesPerRun;
    this.swipeDashDir = 0;
    this.vx = 0;
    this.vy = PHYSICS.flapVelocity;
    this.startY = START_Y;
    this.isFlipping = false;
    this.reactionTimer = undefined;
    this.buzz = loopSfx(this, 'buzz', 0.12);
    this.copter = null;
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.stopLoops());
    // Dev only: open http://localhost:5173/?zone=courtroom to start the run inside a zone.
    const devZone = ZONES.find((z) => z.id === devParam('zone'));
    if (devZone) {
      this.startY = START_Y + devZone.fromMeters * PHYSICS.pixelsPerMeter;
      this.run.heightMeters = devZone.fromMeters;
    }
    this.zone = zoneAt(this.run.heightMeters);

    this.cameras.main.setScroll(0, 0);
    this.bg = this.makeBackdrop(zoneTextureKey(this.zone), -10);

    this.createVimmyAnimations();
    this.player = this.add.sprite(GAME_WIDTH / 2, START_Y, 'vimmy-fly-0').setDisplaySize(PLAYER_SPRITE_SIZE, PLAYER_SPRITE_SIZE).setDepth(5);
    this.player.play(VIMMY_FLY_ANIM);
    this.shieldAura = this.add.circle(this.player.x, this.player.y, PLAYER_SPRITE_SIZE * 0.72, 0x4fc3f7, 0.18).setStrokeStyle(3, 0xb3e5fc, 0.9).setDepth(4).setVisible(false);

    // Top-left panel: score big, climbed meters small, and a row of status chips below it.
    this.hudPanel = this.add.graphics().setScrollFactor(0).setDepth(19);
    this.hudPanel.fillStyle(0x000000, 0.15).fillRoundedRect(10, 12, 164, 70, 16);
    this.hudPanel.fillStyle(0xffffff, 0.95).fillRoundedRect(8, 8, 164, 70, 16);
    this.hudPanel.lineStyle(3, 0xffb300, 1).strokeRoundedRect(8, 8, 164, 70, 16);
    // The dash breads get their own pill so they never blend into the backdrop.
    const breadsW = PHYSICS.swipeDashesPerRun * 32 + 12;
    this.hudPanel.fillStyle(0x000000, 0.15).fillRoundedRect(GAME_WIDTH - breadsW - 6, 12, breadsW, 44, 16);
    this.hudPanel.fillStyle(0xffffff, 0.95).fillRoundedRect(GAME_WIDTH - breadsW - 8, 8, breadsW, 44, 16);
    this.hudPanel.lineStyle(3, 0xffb300, 1).strokeRoundedRect(GAME_WIDTH - breadsW - 8, 8, breadsW, 44, 16);
    this.progressGfx = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.scoreText = this.add
      .text(20, 8, '0', { fontFamily: FONT.family, fontSize: '34px', fontStyle: 'bold', color: '#4e342e' })
      .setScrollFactor(0)
      .setDepth(20);
    this.metersText = this.add
      .text(20, 48, '▲ 0 m', { fontFamily: FONT.family, fontSize: '14px', fontStyle: 'bold', color: '#8d6e63' })
      .setScrollFactor(0)
      .setDepth(20);
    this.lastScore = 0;
    this.chipGfx = this.add.graphics().setScrollFactor(0).setDepth(19);
    this.chipTexts = Array.from({ length: 7 }, () =>
      this.add.text(0, 0, '', { fontFamily: FONT.family, fontSize: '13px', fontStyle: 'bold', color: '#ffffff' }).setScrollFactor(0).setDepth(20).setVisible(false),
    );

    // Dizzy: a pulsing purple wash over the screen and stars circling Vimmy's head.
    this.dizzyOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x8e24aa, 0).setOrigin(0).setScrollFactor(0).setDepth(18);
    this.dizzyStars = Array.from({ length: 3 }, () =>
      this.add.text(0, 0, '★', { fontFamily: FONT.family, fontSize: '18px', color: '#ffeb3b', stroke: '#f57f17', strokeThickness: 3 }).setOrigin(0.5).setDepth(6).setVisible(false),
    );

    // One bread per sideways dash left; spent ones dim.
    this.swipeBreads = Array.from({ length: PHYSICS.swipeDashesPerRun }, (_, i) =>
      addItemSprite(this, GAME_WIDTH - 28 - i * 32, 30, { id: 'cheeseButterBread', color: 0xffca28 }, 28).setScrollFactor(0).setDepth(20),
    ).reverse();

    // Location banner: one small, see-through line, "Stage N · Location" (or just the location within the same stage).
    this.bannerBg = this.add.graphics();
    this.bannerName = this.add.text(0, 0, '', { fontFamily: FONT.family, fontSize: '17px', fontStyle: 'bold', color: '#4e342e', align: 'center' }).setOrigin(0.5);
    this.banner = this.add.container(GAME_WIDTH / 2, BANNER_Y, [this.bannerBg, this.bannerName]).setScrollFactor(0).setDepth(25).setAlpha(0);
    this.showBanner(zoneBannerText(this.zone));

    this.showSwipeHint();

    bindSteering(this, (dir) => this.flap(dir), (dir) => this.swipeDash(dir));

    if (ADMIN) {
      const onNext = () => this.jumpToNextZone();
      const onEnd = () => {
        if (!this.ended) this.endRun();
      };
      this.input.keyboard?.on('keydown-N', onNext);
      this.input.keyboard?.on('keydown-E', onEnd);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.input.keyboard?.off('keydown-N', onNext);
        this.input.keyboard?.off('keydown-E', onEnd);
      });
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 20, 'ADMIN: N = next location, E = end the run', { fontFamily: FONT.family, fontSize: '13px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 8, y: 3 } })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(30);
    }
  }

  /** Soft see-through pill near the bottom with a small caramel arrow either side that nudges outward, fading after a few seconds. */
  private showSwipeHint(): void {
    const text = this.add
      .text(0, 0, t('hud.swipeHint'), { fontFamily: FONT.family, fontSize: '17px', fontStyle: 'bold', color: '#6d4c41', padding: { top: 3, bottom: 3 } })
      .setOrigin(0.5);
    fitWidth(text, GAME_WIDTH - 120);
    const w = text.displayWidth + 76;
    const h = 40;
    const bg = this.add.graphics();
    // Soft and see-through so the playfield shows behind it: a pale butter pill with a white rim.
    bg.fillStyle(0xfff6e8, 0.62).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    bg.lineStyle(2, 0xffffff, 0.85).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    const arrow = (dir: -1 | 1): Phaser.GameObjects.Graphics => {
      const g = this.add.graphics().setPosition(dir * (w / 2 - 24), 0);
      g.fillStyle(COLORS.primaryDark, 1).fillTriangle(dir * 7, 0, -dir * 5, -8, -dir * 5, 8);
      this.tweens.add({ targets: g, x: g.x + dir * 5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return g;
    };
    const arrows = [arrow(-1), arrow(1)];
    const hint = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 60, [bg, text, ...arrows]).setScrollFactor(0).setDepth(25);
    this.tweens.add({
      targets: hint,
      alpha: 0,
      delay: 3500,
      duration: 600,
      onComplete: () => {
        this.tweens.killTweensOf(arrows);
        hint.destroy();
      },
    });
  }

  /**
   * `big` is for the finale announcements: a larger butter-yellow pill that pops in with a wobble and a burst of stars,
   * then pops away. It stays up under two seconds so it never hides the play area for long.
   */
  private showBanner(text: string, big = false): void {
    this.tweens.killTweensOf(this.banner);
    this.layoutBanner(text, big);
    if (!big) {
      // Drop in from above, overshoot and settle, then fade out.
      this.banner.setRotation(0).setAlpha(0).setScale(0.6).setY(BANNER_Y - 24);
      this.tweens.add({ targets: this.banner, alpha: BANNER_ALPHA, scale: 1, y: BANNER_Y, duration: 350, ease: 'Back.easeOut' });
      this.tweens.add({ targets: this.banner, alpha: 0, scale: 1.08, delay: 1300, duration: 500 });
      return;
    }
    this.banner.setAlpha(0).setScale(0.3).setRotation(-0.2).setY(BANNER_Y);
    this.tweens.add({ targets: this.banner, alpha: 0.95, scale: 1, rotation: 0, duration: 340, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.banner, rotation: 0.035, duration: 80, yoyo: true, repeat: 3, delay: 340 }); // a little wobble
    this.tweens.add({ targets: this.banner, alpha: 0, scale: 1.25, delay: 1500, duration: 280, ease: 'Cubic.easeIn' });
    // A quick burst of stars around the pill.
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
      const reach = 120 + Math.random() * 90;
      const star = this.add
        .text(GAME_WIDTH / 2, BANNER_Y, i % 2 ? '★' : '✦', { fontFamily: FONT.family, fontSize: `${14 + Math.floor(Math.random() * 12)}px`, color: i % 3 ? '#f7bd3b' : '#ffffff', stroke: '#b98022', strokeThickness: 3 })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(24)
        .setAlpha(0)
        .setScale(0.3);
      this.tweens.add({
        targets: star,
        x: GAME_WIDTH / 2 + Math.cos(angle) * reach * 1.4,
        y: BANNER_Y + Math.sin(angle) * reach * 0.5,
        alpha: { from: 1, to: 0 },
        scale: 1,
        angle: Math.random() * 120 - 60,
        delay: 160,
        duration: 650,
        ease: 'Cubic.easeOut',
        onStart: () => star.setAlpha(1),
        onComplete: () => star.destroy(),
      });
    }
  }

  /** Banner text is "stage\nname" (or just the name). Lays out one compact line in a pill (larger, yellow and outlined for finales). */
  private layoutBanner(text: string, big: boolean): void {
    const pad = big ? 56 : 28;
    this.bannerName.setScale(1).setFontSize(big ? 32 : 17).setText(text.replace('\n', '  ·  '));
    fitWidth(this.bannerName, GAME_WIDTH - 24 - pad, 0.6); // a long line shrinks to fit the pill
    const w = Math.min(GAME_WIDTH - 24, this.bannerName.displayWidth + pad);
    const h = big ? 60 : 32;
    this.bannerBg.clear();
    if (big) {
      this.bannerBg.fillStyle(0x000000, 0.18).fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2); // soft shadow
      this.bannerBg.fillStyle(COLORS.primary, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
      this.bannerBg.lineStyle(4, COLORS.onPrimary, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    } else {
      this.bannerBg.fillStyle(0xffffff, 1).fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    }
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

  /** A pop-up that bounces in above Vimmy, floats up and fades. Big ones are larger and linger. */
  private showPopup(message: string, stroke: string, big = false): void {
    const text = this.add
      .text(this.player.x, this.player.y - 50, message, {
        fontFamily: FONT.family,
        fontSize: big ? '34px' : '22px',
        color: '#ffffff',
        stroke,
        strokeThickness: big ? 7 : 5,
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setScale(0.3);
    text.x = Phaser.Math.Clamp(text.x, text.width / 2 + 8, GAME_WIDTH - text.width / 2 - 8);
    this.tweens.add({ targets: text, scale: big ? 1.3 : 1.15, duration: big ? 260 : 220, ease: 'Back.easeOut' });
    this.tweens.add({ targets: text, y: text.y - (big ? 90 : 70), alpha: 0, delay: big ? 800 : 500, duration: 700, onComplete: () => text.destroy() });
  }

  /** Briefly turn Vimmy toward the player when she collects one of the five buffs. */
  private playBuffReaction(item: ItemDef): void {
    const texture = BUFF_REACTION_TEXTURE[item.id];
    if (!texture || this.isFlipping || this.swipeDashDir !== 0) return;

    this.reactionTimer?.remove(false);
    this.player.stop().setTexture(texture);
    this.reactionTimer = this.time.delayedCall(item.id === 'helicopter' ? 280 : 560, () => {
      this.reactionTimer = undefined;
      if (!this.player.active || this.ended) return;
      if (item.id === 'helicopter') this.playHelicopterFlip();
      else this.player.play(VIMMY_FLY_ANIM);
    });
  }

  /** Three compact negative faces cover queasy, stunned and crash effects. */
  private playDebuffReaction(item: ItemDef): void {
    const texture = DEBUFF_REACTION_TEXTURE[item.id];
    if (!texture || this.isFlipping || this.swipeDashDir !== 0) return;

    this.reactionTimer?.remove(false);
    this.player.stop().setTexture(texture);
    this.reactionTimer = this.time.delayedCall(item.id === 'carCrash' ? 700 : 560, () => {
      this.reactionTimer = undefined;
      if (this.player.active && !this.ended) this.player.play(VIMMY_FLY_ANIM);
    });
  }

  /** Swap the backdrop and announce the zone when the dog climbs past a milestone. */
  private updateZone(): void {
    const finale = finaleAt(this.run.heightMeters);
    if (finale && finale.zoneId !== this.finaleZone) {
      this.showBanner(tDynamic(`finale.${finale.zoneId}`, ''), true);
      this.finaleGiven = 0;
    }
    this.finaleZone = finale?.zoneId ?? null;
    // Guaranteed items drop at even steps through the finale (two of them: a third and two thirds of the way).
    const must = finale?.guaranteed;
    if (finale && must && this.finaleGiven < must.count && this.run.heightMeters >= finale.fromMeters + (FINALE_METERS * (this.finaleGiven + 1)) / (must.count + 1)) {
      this.finaleGiven += 1;
      this.spawnOne(this.run.heightMeters, 0, undefined, must.id);
    }
    const zone = zoneAt(this.run.heightMeters);
    if (zone.id === this.zone.id) return;
    const previous = this.zone;
    this.zone = zone;
    // Crossfade: keep the old backdrop on top, scrolling in step, and fade it out over the new one.
    this.bgFade?.destroy();
    this.bgFade = this.makeBackdrop(zoneTextureKey(previous), -9);
    this.bg.setTexture(zoneTextureKey(zone));
    const fade = this.bgFade;
    this.tweens.add({ targets: fade, alpha: 0, duration: 1200, ease: 'Sine.easeInOut', onComplete: () => { fade.destroy(); if (this.bgFade === fade) this.bgFade = null; } });
    this.showBanner(zoneBannerText(zone, previous));
  }

  /** Emergency sideways dash on a swipe; limited uses per run. */
  private swipeDash(dir: -1 | 1): void {
    if (this.ended || this.run.isStunned || this.isFlipping || this.swipeDashDir !== 0 || this.swipesLeft <= 0) return;
    this.swipesLeft--;
    playSfx(this, 'dash', 0.7);
    const spent = this.swipeBreads[this.swipesLeft];
    this.tweens.add({ targets: spent, scale: spent.scale * 1.6, duration: 120, yoyo: true });
    const steer = this.run.isDisoriented ? -dir : dir;
    this.swipeDashDir = steer as -1 | 1;
    this.reactionTimer?.remove(false);
    this.reactionTimer = undefined;
    this.player.stop().setTexture(DASH_TEXTURE[String(steer) as '-1' | '1']);
    this.vx = 0;
    this.vy = 0;
  }

  /** Admin only: teleport Vimmy (and the camera) up to the start of the next location. */
  private jumpToNextZone(): void {
    const next = ZONES[ZONES.indexOf(this.zone) + 1];
    if (!next) return;
    const dy = (next.fromMeters - this.run.heightMeters) * PHYSICS.pixelsPerMeter + 1;
    this.player.y -= dy;
    this.cameras.main.scrollY -= dy;
  }

  private flap(dir: -1 | 1): void {
    if (this.ended || this.run.isStunned || this.swipeDashDir !== 0) return;
    const power = this.run.strongFlapMs > 0 ? this.run.strongFlapFactor : 1;
    const slow = this.run.slowMs > 0 ? this.run.slowFactor : 1; // fish sauce bread: slower flaps and drift
    const finaleLift = finaleAt(this.run.heightMeters)?.flapScale ?? 1;
    this.vy = PHYSICS.flapVelocity * power * slow * finaleLift;
    playSfx(this, 'flap', 0.5, 0.12);
    const steer = this.run.isDisoriented ? -dir : dir; // disoriented: left/right swapped
    this.vx = steer * PHYSICS.driftVelocity * slow;
  }

  update(time: number, deltaMs: number): void {
    if (this.ended) return;
    const dt = Math.min(deltaMs, 66) / 1000; // clamp so a tab switch can't teleport the player; high enough that 30 fps (Low Power Mode) stays at full speed
    this.run.tick(dt * 1000);

    this.movePlayer(dt);
    this.updateCamera(dt);
    this.updateZone();
    this.spawnItems(dt * 1000);
    this.updateItems(dt);
    this.updateHud();
    this.updateCopterSound();
    this.updateShieldAura(time);

    const cam = this.cameras.main;
    if (ADMIN) {
      const floor = cam.scrollY + GAME_HEIGHT - PLAYER_SPRITE_SIZE;
      if (this.player.y > floor) {
        this.player.y = floor;
        this.vy = PHYSICS.flapVelocity;
      }
    } else if (this.player.y > cam.scrollY + GAME_HEIGHT + PLAYER_SPRITE_SIZE) this.endRun();
  }

  private movePlayer(dt: number): void {
    if (this.swipeDashDir !== 0) {
      // Straight, level run to the far wall: no gravity, no wall stun.
      const half = PLAYER_SPRITE_SIZE / 2;
      const target = this.swipeDashDir < 0 ? half : GAME_WIDTH - half;
      const step = PHYSICS.swipeDashSpeed * dt;
      this.player.x = this.swipeDashDir < 0 ? Math.max(target, this.player.x - step) : Math.min(target, this.player.x + step);
      if (this.player.x === target) {
        this.swipeDashDir = 0;
        this.player.play(VIMMY_FLY_ANIM);
        this.vx = 0;
        this.vy = PHYSICS.swipeDashExitLift;
      }
      return;
    }
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
    const wind = finaleAt(this.run.heightMeters)?.wind;
    if (wind) this.vx += Math.sin(this.time.now / 1200) * wind * dt * 5; // a current that swings left and right; settles near `wind` px/s at its peak

    // Side walls: bounce away and stagger briefly, so hugging a wall is never a free path up.
    const half = PLAYER_SPRITE_SIZE / 2;
    const nextX = this.player.x + this.vx * dt;
    this.player.x = Phaser.Math.Clamp(nextX, half, GAME_WIDTH - half);
    if (this.player.x !== nextX) {
      const away = nextX < half ? 1 : -1;
      this.vx = away * Math.max(PHYSICS.wallKick, Math.abs(this.vx) * PHYSICS.wallBounce);
      if (!ADMIN) this.run.stun(PHYSICS.wallStunMs);
    }
    this.player.y += this.vy * dt;
  }

  /** A scrolling backdrop tile, a little bigger than the screen, with a blur filter that starts switched off. */
  private makeBackdrop(textureKey: string, depth: number): Phaser.GameObjects.TileSprite {
    const sprite = this.add
      .tileSprite(-BG_BLEED, -BG_BLEED, GAME_WIDTH + BG_BLEED * 2, GAME_HEIGHT + BG_BLEED * 2, textureKey)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(depth);
    sprite.tilePositionX = -BG_BLEED; // keeps the pattern where it was before the bleed
    sprite.enableFilters();
    sprite.filters!.internal.addBlur(0, 0, 0, 1);
    this.applyBackdropBlur(sprite); // starts at the current blur, so a crossfading backdrop never flashes sharp
    return sprite;
  }

  /**
   * The backdrop blurs more while the helicopter dash runs and as the climb speeds up, so the fast scroll
   * is less dizzying. It eases in and out, and the filter is switched off when the backdrop is sharp.
   */
  private updateBackdropBlur(dt: number, d: number): void {
    const target = this.run.dashMs > 0 ? 1 : d * BG_BLUR_SPEED_SHARE;
    this.bgBlurLevel += (target - this.bgBlurLevel) * (1 - Math.exp(-BG_BLUR_EASE * dt));
    this.applyBackdropBlur(this.bg);
    if (this.bgFade) this.applyBackdropBlur(this.bgFade);
  }

  private applyBackdropBlur(sprite: Phaser.GameObjects.TileSprite): void {
    const level = this.bgBlurLevel;
    sprite.renderFilters = level > 0.01;
    if (!sprite.renderFilters) return;
    const blur = sprite.filters!.internal.list[0] as Phaser.Filters.Blur;
    blur.x = BG_BLUR_MAX.x * level;
    blur.y = BG_BLUR_MAX.y * level;
  }

  /**
   * Camera only ever moves up. It scrolls steadily (faster with height) and jumps
   * ahead if the player flies above the lead line, so the player can never outrun it.
   */
  private updateCamera(dt: number): void {
    const cam = this.cameras.main;
    const speed = ramp(CAMERA.speed, difficulty(this.run.heightMeters));
    cam.scrollY = Math.min(cam.scrollY - speed * dt, this.player.y - CAMERA.leadPx);
    this.bg.tilePositionY = cam.scrollY - BG_BLEED;
    if (this.bgFade) this.bgFade.tilePositionY = cam.scrollY - BG_BLEED;
    this.updateBackdropBlur(dt, difficulty(this.run.heightMeters));
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
    const { untilMeters, extraChance } = ITEM_RULES.startFood;
    if (h < untilMeters && Math.random() < extraChance * (1 - h / untilMeters)) this.spawnOne(h, 2, 'points');
  }

  private spawnOne(heightMeters: number, row: number, onlyKind?: ItemDef['kind'], forceId?: string): void {
    const def = (forceId && getItem(forceId)) || pickItem(heightMeters, Math.random, onlyKind);
    const cam = this.cameras.main;
    const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
    const y = cam.scrollY - 40 - row * 70;
    const visualSize = itemDisplaySize(def.id, ITEM_SPRITE_SIZE);
    const halo = !ADMIN ? undefined : this.add.circle(x, y, visualSize * 0.55, OUTLINE[def.kind], 0.35).setStrokeStyle(2, OUTLINE[def.kind], 0.8).setDepth(2.9);
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

      it.halo?.setPosition(s.x, s.y);

      const reach = (PLAYER_HITBOX_SIZE + Math.max(ITEM_RULES.size, it.visualSize * 0.75)) / 2;
      if (Math.abs(s.x - this.player.x) < reach && Math.abs(s.y - this.player.y) < reach) {
        if (it.def.kind === 'debuff' && (ADMIN || this.swipeDashDir !== 0 || this.run.dashMs > 0)) continue; // swipe dash or helicopter: debuffs pass through harmlessly
        if (it.def.kind === 'buff') {
          this.playBuffReaction(it.def);
          playSfx(this, itemSfx(it.def.id, 'buff'), 0.8);
          playSfx(this, 'yips', 0.7, 0.08);
          this.showPopup(tDynamic(`buff.${it.def.id}`, itemName(it.def.id, it.def.label)), '#2e7d32');
        } else if (it.def.kind === 'debuff' && this.run.shield) {
          // The lawyer suit takes the hit: say so instead of announcing the debuff.
          this.showPopup(t('shield.blocked'), '#1565c0', true);
          playSfx(this, 'block', 0.9);
          this.burstShield();
        } else if (it.def.kind === 'debuff') {
          const big = it.def.id === 'carCrash' || it.def.id === 'planner';
          this.showPopup(tDynamic(`debuff.${it.def.id}`, itemName(it.def.id, it.def.label)), '#b71c1c', big);
          if (big) this.cameras.main.shake(300, 0.012);
          playSfx(this, itemSfx(it.def.id, 'debuff'), 0.8);
        }
        const pointsBefore = this.run.itemPoints;
        const applied = this.run.collect(it.def);
        const gained = this.run.itemPoints - pointsBefore;
        if (it.def.kind === 'points' && gained > 0) {
          playSfx(this, itemSfx(it.def.id, 'points', gained), 0.7, 0.06);
          if (itemSfx(it.def.id, 'points', gained) !== 'point') playSfx(this, 'point', 0.4, 0.1);
        }
        if (it.def.kind === 'points' && gained !== 0) this.showPopup(`${gained > 0 ? '+' : ''}${gained}`, gained > 0 ? '#e65100' : '#b71c1c', gained >= 100);
        if (it.def.kind === 'debuff' && applied) this.playDebuffReaction(it.def);
        this.remove(it);
      } else if (s.y > cam.scrollY + GAME_HEIGHT + 60) {
        this.remove(it);
      }
    }
  }

  /** Keeps the shield bubble on Vimmy, gently pulsing, for as long as the shield lasts. */
  private updateShieldAura(timeMs: number): void {
    const on = this.run.shield;
    this.shieldAura.setVisible(on);
    if (!on) return;
    const pulse = Math.sin(timeMs / 220);
    this.shieldAura.setPosition(this.player.x, this.player.y).setScale(1 + 0.05 * pulse).setAlpha(0.8 + 0.2 * pulse);
  }

  /** The bubble pops outward when the shield takes a hit. */
  private burstShield(): void {
    const ring = this.add.circle(this.player.x, this.player.y, PLAYER_SPRITE_SIZE * 0.72, 0x4fc3f7, 0.3).setStrokeStyle(4, 0xffffff, 1).setDepth(6);
    this.tweens.add({ targets: ring, scale: 2, alpha: 0, duration: 450, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    // A ring of sparks flies off the bubble, as if the hit glanced away.
    const sparks = 10;
    for (let i = 0; i < sparks; i++) {
      const angle = (i / sparks) * Math.PI * 2 + Math.random() * 0.3;
      const spark = this.add.circle(this.player.x, this.player.y, 4, i % 2 ? 0xffffff : 0xffeb3b).setDepth(7);
      this.tweens.add({
        targets: spark,
        x: this.player.x + Math.cos(angle) * 85,
        y: this.player.y + Math.sin(angle) * 85,
        alpha: 0,
        scale: 0.2,
        duration: 420,
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
    this.cameras.main.flash(120, 79, 195, 247, false); // a quick pale-blue flash
  }

  /** The rotor chop plays only while the helicopter dash is running. */
  private updateCopterSound(): void {
    if (this.run.dashMs > 0 && !this.copter) this.copter = loopSfx(this, 'copter', 0.5);
    else if (this.run.dashMs <= 0 && this.copter) {
      this.copter.destroy();
      this.copter = null;
    }
  }

  private stopLoops(): void {
    this.buzz?.destroy();
    this.copter?.destroy();
    this.buzz = null;
    this.copter = null;
  }

  private remove(it: FallingItem): void {
    it.shape.destroy();
    it.halo?.destroy();
    this.items.splice(this.items.indexOf(it), 1);
  }

  private updateHud(): void {
    const score = this.run.score;
    this.scoreText.setText(`${score}`);
    this.metersText.setText(`▲ ${Math.floor(this.run.heightMeters)} m`);
    // Bar showing progress toward the next location.
    const next = ZONES[ZONES.indexOf(this.zone) + 1];
    const fraction = next ? Phaser.Math.Clamp((this.run.heightMeters - this.zone.fromMeters) / (next.fromMeters - this.zone.fromMeters), 0, 1) : 1;
    this.progressGfx.clear();
    this.progressGfx.fillStyle(0xf0dcc3, 1).fillRoundedRect(92, 55, 70, 8, 4);
    if (fraction > 0) this.progressGfx.fillStyle(0xffb300, 1).fillRoundedRect(92, 55, Math.max(8, 70 * fraction), 8, 4);
    if (score !== this.lastScore) {
      // Pop and flash green on a gain, red on a loss.
      this.scoreText.setColor(score > this.lastScore ? '#2e7d32' : '#b71c1c');
      this.tweens.killTweensOf(this.scoreText);
      this.scoreText.setScale(1.3);
      this.tweens.add({ targets: this.scoreText, scale: 1, duration: 250, ease: 'Back.easeOut', onComplete: () => this.scoreText.setColor('#4e342e') });
      this.lastScore = score;
    }
    this.swipeBreads.forEach((b, i) => b.setAlpha(i < this.swipesLeft ? 1 : 0.2));

    const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
    const chips: { label: string; color: number }[] = [];
    if (this.run.shield) chips.push({ label: `🛡 ${t('hud.shield')}`, color: COLORS.buff });
    if (this.run.dashMs > 0) chips.push({ label: `🚁 ${t('hud.dash')} ${secs(this.run.dashMs)}`, color: COLORS.buff });
    if (this.run.strongFlapMs > 0) chips.push({ label: `💪 ${t('hud.power')} ${secs(this.run.strongFlapMs)}`, color: COLORS.buff });
    if (this.run.doublePointsMs > 0) chips.push({ label: `✨ ${t('hud.x2')} ${secs(this.run.doublePointsMs)}`, color: COLORS.buff });
    if (this.run.isStunned) chips.push({ label: `💫 ${t('hud.stunned')} ${secs(this.run.stunMs)}`, color: COLORS.debuff });
    if (this.run.isDisoriented) chips.push({ label: `😵 ${t('hud.dizzy')} ${secs(this.run.disorientMs)}`, color: COLORS.debuff });
    if (this.run.slowMs > 0) chips.push({ label: `🐌 ${t('hud.slow')} ${secs(this.run.slowMs)}`, color: COLORS.debuff });

    this.chipGfx.clear();
    let y = 88;
    this.chipTexts.forEach((txt, i) => {
      const chip = chips[i];
      txt.setVisible(!!chip);
      if (!chip) return;
      txt.setText(chip.label).setPosition(18, y + 3);
      this.chipGfx.fillStyle(chip.color, 0.92).fillRoundedRect(8, y, txt.width + 20, 22, 11);
      y += 26;
    });

    if (this.run.isStunned) this.player.setTint(0xb0bec5);
    else this.player.clearTint();
    this.updateDizzyEffect();
  }

  private updateDizzyEffect(): void {
    const dizzy = this.run.isDisoriented;
    const now = this.time.now / 1000;
    this.dizzyOverlay.setFillStyle(0x8e24aa, dizzy ? 0.1 + 0.07 * Math.sin(now * 6) : 0);
    this.dizzyStars.forEach((star, i) => {
      star.setVisible(dizzy);
      if (!dizzy) return;
      const a = now * 5 + (i * Math.PI * 2) / this.dizzyStars.length;
      star.setPosition(this.player.x + Math.cos(a) * 26, this.player.y - 34 + Math.sin(a) * 8);
      star.setDepth(Math.sin(a) > 0 ? 7 : 4); // pass in front of and behind the head
    });
    // Vimmy wobbles side to side while dizzy.
    this.player.setAngle(dizzy ? Math.sin(now * 9) * 14 : 0);
  }

  private endRun(): void {
    this.ended = true;
    this.stopLoops();
    this.scene.start(SCENES.receipt, { result: { ...this.run.result(), zone: this.zone.id } });
  }
}
