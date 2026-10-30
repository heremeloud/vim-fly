import { beginRun } from '../leaderboard/client';
import Phaser from 'phaser';
import { devFlag, devParam } from '../core/devTools';
import { itemSfx, loopSfx, playSfx, setSoundEnabled, soundEnabled } from '../audio/sfx';
import { GAME_WIDTH, GAME_HEIGHT, PHYSICS, ITEM_RULES, CAMERA, SCENES } from '../core/constants';
import { bindSteering } from '../core/input';
import { itemName, t, tDynamic } from '../i18n';
import { REACTION_ICON, STATUS_ICON } from '../core/effectIcons';
import { FINALE_BOARD, layoutBanner, type BannerBoard } from '../ui/boards';
import { CHIP_ICON, climbSpeedLines, dashBurst, dashImpact, dashTrail, drawStatusChip, popup } from '../ui/fx';
import { emojiTextureKey } from '../core/emojiFile';
import { COLORS, FONT, hex } from '../ui/theme';
import { drawIcon, type IconId } from '../ui/icons';
import { fitWidth } from '../ui/widgets';
import { RunState } from '../core/RunState';
import { difficulty, ramp } from '../core/difficulty';
import { FINALE_METERS, FINALE_RUSH, finaleAt } from '../core/finales';
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
/** Reactions briefly zoom Vimmy in so the few-pixel facial changes read during play. */
const PLAYER_REACTION_SIZE = 120;
const REACTION_HOLD_MS = 760;
const REACTION_CRASH_HOLD_MS = 940;
const REACTION_HELICOPTER_HOLD_MS = 380;
const REACTION_GOLDEN_HOLD_MS = 1100;
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
/** The tap-left / tap-right guides stay over the first 50 m, fading out over the last 8 of them, at this height on screen. */
const TAP_GUIDE_METERS = 50;
const TAP_GUIDE_FADE_METERS = 8;
const TAP_GUIDE_Y = GAME_HEIGHT - 190;
/** Corner radius of the swipe hint and the tap guides: a rounded rectangle, not a full pill. */
const HINT_RADIUS = 14;
const VIMMY_FLY_ANIM = 'vimmy-fly';
const VIMMY_FLIP_ANIM = 'vimmy-helicopter-flip';
const BUFF_REACTION_TEXTURE: Readonly<Record<string, string>> = {
  oyster: 'vimmy-buff-oyster',
  lawyerSuit: 'vimmy-buff-lawyerSuit',
  handkerchief: 'vimmy-buff-handkerchief',
  rollingPin: 'vimmy-buff-rollingPin',
  helicopter: 'vimmy-buff-helicopter',
  goldenRetriever: 'vimmy-points-goldenRetriever', // its own extra-joyful pose
};
/** How fast (px/s) the golden retriever magnet pulls an item that is right at its edge, rising as the item gets closer. */
const MAGNET_SPEED = 360;
const REACTION_ICON_OFFSET = 78;
const REACTION_ICON_SIZE = 40;
const REACTION_ICON_SCALE = REACTION_ICON_SIZE / 64; // the emoji images are 64 px
/** Each cut-in gets its own friendly comic accent instead of sharing one fixed ring color. */
const REACTION_CELL_ACCENT: Readonly<Record<string, number>> = {
  oyster: 0xffb74d,
  lawyerSuit: 0x64b5f6,
  handkerchief: 0xf48fb1,
  rollingPin: 0xffca28,
  helicopter: 0x4dd0e1,
  goldenRetriever: 0xffd54f,
  planner: 0xff7043,
  gavelHammer: 0xba68c8,
  cilantroBread: 0x9ccc65,
  fishSauceBread: 0x80cbc4,
  carCrash: 0xef5350,
  dogEars: 0xf48fb1,
};
const DASH_TEXTURE = { '-1': 'vimmy-dash-left', '1': 'vimmy-dash-right' } as const;
const DEBUFF_REACTION_TEXTURE: Readonly<Record<string, string>> = {
  cilantroBread: 'vimmy-debuff-queasy',
  fishSauceBread: 'vimmy-debuff-queasy',
  planner: 'vimmy-debuff-disappointed',
  gavelHammer: 'vimmy-debuff-stunned',
  carCrash: 'vimmy-debuff-crash',
  dogEars: 'vimmy-debuff-embarrassed',
};
const SMELLY_BREADS = new Set(['cilantroBread', 'fishSauceBread']);
/** Pickup audio follows the effect strength documented in items/ITEMS.md instead of flattening every buff. */
const BUFF_AUDIO_CUE: Readonly<Record<string, { effect: number; yips: number }>> = {
  handkerchief: { effect: 0.56, yips: 0.32 }, // conditional instant cleanse
  lawyerSuit: { effect: 0.66, yips: 0.42 }, // one blocked debuff
  oyster: { effect: 0.74, yips: 0.54 }, // five seconds of double points
  rollingPin: { effect: 0.84, yips: 0.66 }, // five seconds of 150% flaps
  helicopter: { effect: 0.96, yips: 0.82 }, // the big three-second climb
  goldenRetriever: { effect: 0.9, yips: 0.75 }, // the rare magnet
};
const DEBUFF_AUDIO_VOLUME: Readonly<Record<string, number>> = {
  gavelHammer: 0.58, // one-second stun
  cilantroBread: 0.64, // three seconds of reversed steering
  fishSauceBread: 0.72, // five seconds at 60% movement
  planner: 0.86, // stun plus -300 points
  carCrash: 1, // stun, knockback, points loss and dash cancellation
  kitten: 1, // loud enough to hear over the swerve
  dogEars: 0.5, // fumbled flaps for six seconds, and it pays points
};

/**
 * Core loop with Vimmy's animated sprite. Tap left/right to flap and drift,
 * gravity pulls down, the camera follows the climb, items fall from above.
 * Falling off the bottom of the screen ends the run.
 */
export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  /** Angled manga cell behind a reaction, making the enlarged face stand out from busy backdrops. */
  private reactionFocus!: Phaser.GameObjects.Graphics;
  /** Emoji that pops above Vimmy's head during a reaction. */
  private reactionIcon!: Phaser.GameObjects.Image;
  private chipIcons: Phaser.GameObjects.Image[] = [];
  /** Twinkling little shields around Vimmy while the lawyer-suit shield is up. */
  private shieldAura!: Phaser.GameObjects.Graphics;
  /** Clock for the power fly's rising sparkles. */
  private powerEmberMs = 0;
  private bg!: Phaser.GameObjects.TileSprite;
  /** The previous location's backdrop, fading out on top of `bg` after a zone change. */
  private bgFade: Phaser.GameObjects.TileSprite | null = null;
  /** 0 = sharp backdrop, 1 = fully blurred. Eases toward the target so the blur never pops. */
  private bgBlurLevel = 0;
  /** The location whose finale (its last stretch) is under way, so its banner shows only once per run. */
  private finaleZone: string | null = null;
  /** How many of the finale's guaranteed items have been dropped so far. */
  private finaleGiven = 0;
  /** How many of a fixed-total finale's drops have fallen so far. */
  private finaleDropped = 0;
  /** Pulsing edge glow that stays visible for the whole location rush. */
  private finaleFrame!: Phaser.GameObjects.Graphics;
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
  private paused = false;
  private pauseOverlay: Phaser.GameObjects.GameObject[] = [];
  private hudButtonIcons: Phaser.GameObjects.Graphics[] = [];
  private swipesLeft = PHYSICS.swipeDashesPerRun;
  /** Direction of the dash in progress (0 = none). While dashing Vimmy flies level and ignores debuffs. */
  private swipeDashDir: -1 | 0 | 1 = 0;
  /** Counts down between afterimages while dashing sideways. */
  private dashTrailMs = 0;
  /** Counts down between batches of comic speed lines during the helicopter climb. */
  private climbLinesMs = 0;
  private swipeBreads: Phaser.GameObjects.Image[] = [];
  /** The two "tap here" guides shown over the first stretch of the climb. */
  private tapGuide: Phaser.GameObjects.Container[] = [];
  /** The swipe hint, kept up as long as the tap guides so the two leave together. */
  private swipeHint: Phaser.GameObjects.Container | null = null;
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
    this.finaleDropped = 0;
    this.spawnTimerMs = 0;
    this.ended = false;
    this.paused = false;
    this.pauseOverlay = [];
    this.hudButtonIcons = [];
    this.tapGuide = [];
    this.swipeHint = null;
    this.swipesLeft = PHYSICS.swipeDashesPerRun;
    this.swipeDashDir = 0;
    this.vx = 0;
    this.vy = PHYSICS.flapVelocity;
    this.startY = START_Y;
    this.isFlipping = false;
    this.reactionTimer = undefined;
    this.buzz = loopSfx(this, 'buzz', 0.05);
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
    this.reactionFocus = this.add.graphics().setPosition(this.player.x, this.player.y).setDepth(4.5).setVisible(false);
    this.reactionIcon = this.add.image(this.player.x, this.player.y, '__WHITE').setScale(REACTION_ICON_SCALE).setDepth(6).setVisible(false);
    this.powerEmberMs = 0;
    this.shieldAura = this.add.graphics().setDepth(4).setVisible(false);

    // Top-left panel: score big, climbed meters small, and a row of status chips below it.
    this.hudPanel = this.add.graphics().setScrollFactor(0).setDepth(19);
    // Cream cards with a chocolate crust outline and a hard shadow, like the buttons in the menus.
    const panel = (x: number, y: number, w: number, h: number): void => {
      this.hudPanel.fillStyle(COLORS.onPrimary, 0.28).fillRoundedRect(x + 2, y + 4, w, h, 16);
      this.hudPanel.fillStyle(COLORS.background, 0.96).fillRoundedRect(x, y, w, h, 16);
      this.hudPanel.lineStyle(3, COLORS.onPrimary, 1).strokeRoundedRect(x, y, w, h, 16);
    };
    panel(8, 8, 164, 70);
    // The dash breads get their own pill so they never blend into the backdrop.
    const breadsW = PHYSICS.swipeDashesPerRun * 32 + 12;
    panel(GAME_WIDTH - breadsW - 8, 8, breadsW, 44);
    this.progressGfx = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.scoreText = this.add
      .text(20, 5, '0', { fontFamily: FONT.display, fontSize: '32px', color: hex(COLORS.text), stroke: hex(COLORS.text), strokeThickness: 2 })
      .setScrollFactor(0)
      .setDepth(20);
    this.metersText = this.add
      .text(20, 50, '▲ 0 m', { fontFamily: FONT.family, fontSize: '14px', fontStyle: 'bold', color: hex(COLORS.muted) })
      .setScrollFactor(0)
      .setDepth(20);
    this.lastScore = 0;
    this.chipGfx = this.add.graphics().setScrollFactor(0).setDepth(19);
    this.chipTexts = Array.from({ length: 7 }, () =>
      this.add.text(0, 0, '', { fontFamily: FONT.family, fontSize: '13px', fontStyle: 'bold', color: '#ffffff' }).setScrollFactor(0).setDepth(20).setVisible(false),
    );
    this.chipIcons = Array.from({ length: 7 }, () => this.add.image(0, 0, '__WHITE').setDisplaySize(CHIP_ICON, CHIP_ICON).setScrollFactor(0).setDepth(20).setVisible(false));

    // Dizzy: a pulsing purple wash over the screen and stars circling Vimmy's head.
    this.dizzyOverlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x8e24aa, 0).setOrigin(0).setScrollFactor(0).setDepth(18);
    this.dizzyStars = Array.from({ length: 3 }, () =>
      this.add.text(0, 0, '★', { fontFamily: FONT.family, fontSize: '18px', color: '#ffeb3b', stroke: '#f57f17', strokeThickness: 3 }).setOrigin(0.5).setDepth(6).setVisible(false),
    );

    // Location finales are gameplay events, not just banners: this glow remains until the next location begins.
    this.finaleFrame = this.add.graphics().setScrollFactor(0).setDepth(17).setVisible(false);
    this.finaleFrame.lineStyle(8, COLORS.primary, 0.9).strokeRoundedRect(5, 5, GAME_WIDTH - 10, GAME_HEIGHT - 10, 22);

    // One bread per sideways dash left; spent ones dim.
    this.swipeBreads = Array.from({ length: PHYSICS.swipeDashesPerRun }, (_, i) =>
      addItemSprite(this, GAME_WIDTH - 28 - i * 32, 30, { id: 'cheeseButterBread', color: 0xffca28 }, 28).setScrollFactor(0).setDepth(20),
    ).reverse();

    // Location banner: one small, see-through line, "Stage N · Location" (or just the location within the same stage).
    this.bannerBg = this.add.graphics();
    this.bannerName = this.add.text(0, 0, '', { fontFamily: FONT.display, fontSize: '17px', color: hex(COLORS.text), align: 'center', stroke: hex(COLORS.text), strokeThickness: 1 }).setOrigin(0.5);
    this.banner = this.add.container(GAME_WIDTH / 2, BANNER_Y, [this.bannerBg, this.bannerName]).setScrollFactor(0).setDepth(25).setAlpha(0);
    this.showBanner(zoneBannerText(this.zone));

    this.showSwipeHint();
    this.showTapGuide();

    bindSteering(
      this,
      (dir) => {
        if (!this.paused) this.flap(dir);
      },
      (dir) => {
        if (!this.paused) this.swipeDash(dir);
      },
    );
    this.addHudButtons();
    const onPauseKey = () => this.togglePause();
    this.input.keyboard?.on('keydown-P', onPauseKey);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.off('keydown-P', onPauseKey);
      if (this.paused) this.sound.resumeAll();
    });

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

  /** Two round buttons under the dash breads: sound on/off and pause/resume. */
  private addHudButtons(): void {
    const y = 76;
    const r = 19;
    const spots: { id: 'sound' | 'pause'; x: number }[] = [
      { id: 'sound', x: GAME_WIDTH - 28 - 46 },
      { id: 'pause', x: GAME_WIDTH - 28 },
    ];
    const bg = this.add.graphics().setScrollFactor(0).setDepth(19);
    const iconFor = (id: 'sound' | 'pause'): IconId => (id === 'sound' ? (soundEnabled() ? 'speaker' : 'speakerOff') : this.paused ? 'play' : 'pause');
    const redraw = (): void => {
      this.hudButtonIcons.forEach((g) => g.destroy());
      this.hudButtonIcons = spots.map((s) => drawIcon(this, iconFor(s.id), s.x, y, COLORS.text).setScrollFactor(0).setDepth(21));
    };
    spots.forEach((s) => {
      bg.fillStyle(COLORS.onPrimary, 0.28).fillCircle(s.x + 1, y + 3, r);
      bg.fillStyle(COLORS.background, 0.96).fillCircle(s.x, y, r);
      bg.lineStyle(3, COLORS.onPrimary, 1).strokeCircle(s.x, y, r);
      const hit = this.add.circle(s.x, y, r + 4, 0xffffff, 0.001).setScrollFactor(0).setDepth(22).setInteractive({ useHandCursor: true });
      hit.on('pointerup', () => {
        if (s.id === 'sound') setSoundEnabled(this.game, !soundEnabled());
        else this.togglePause();
        redraw();
      });
    });
    redraw();
    this.refreshHudButtons = redraw;
  }

  private refreshHudButtons: () => void = () => {};

  private togglePause(): void {
    if (this.ended) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.sound.pauseAll();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.player.anims.pause();
      const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35).setOrigin(0).setScrollFactor(0).setDepth(18.5);
      const text = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, t('hud.paused'), { fontFamily: FONT.display, fontSize: '40px', color: '#ffffff', stroke: hex(COLORS.text), strokeThickness: 6 })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(24);
      this.pauseOverlay = [dim, text];
    } else {
      this.sound.resumeAll();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.player.anims.resume();
      this.pauseOverlay.forEach((o) => o.destroy());
      this.pauseOverlay = [];
    }
    this.refreshHudButtons();
  }

  /**
   * For the first TAP_GUIDE_METERS of the climb: a soft card on each half of the screen with a tapping hand and
   * "Tap" with an arrow either way, so a new player sees at once that the two halves steer. They fade out as the climb nears the mark.
   */
  private showTapGuide(): void {
    const make = (dir: -1 | 1): Phaser.GameObjects.Container => {
      // The same look as the swipe hint: a soft see-through pale butter pill with a white rim, brown bold text and caramel triangles that nudge the way they point.
      const w = 116;
      const h = 100;
      const bg = this.add.graphics();
      bg.fillStyle(0xfff6e8, 0.62).fillRoundedRect(-w / 2, -h / 2, w, h, HINT_RADIUS);
      bg.lineStyle(2, 0xffffff, 0.85).strokeRoundedRect(-w / 2, -h / 2, w, h, HINT_RADIUS);
      const handY = -17;
      const scale = 2;
      const ripple = this.add.circle(0, handY - 9 * scale, 10, 0xffffff, 0).setStrokeStyle(2.5, COLORS.primaryDark, 0.85);
      const hand = drawIcon(this, 'tap', 0, handY, 0x6d4c41, { width: 2.2 }).setScale(scale);
      this.tweens.add({ targets: hand, y: handY + 6, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); // a tapping finger
      this.tweens.add({ targets: ripple, scale: 2.2, alpha: 0, duration: 840, repeat: -1, ease: 'Sine.easeOut' });
      const text = this.add.text(0, 0, t('hud.tap'), { fontFamily: FONT.family, fontSize: '19px', fontStyle: 'bold', color: '#6d4c41', padding: { top: 3, bottom: 3 } }).setOrigin(0.5);
      const rowY = 31;
      const arrowGap = 10;
      const arrowW = 12;
      const total = arrowW + arrowGap + text.width;
      text.setPosition(dir < 0 ? total / 2 - text.width / 2 : -total / 2 + text.width / 2, rowY);
      const arrow = this.add.graphics().setPosition(dir < 0 ? -total / 2 + arrowW / 2 : total / 2 - arrowW / 2, rowY);
      arrow.fillStyle(COLORS.primaryDark, 1).fillTriangle(dir * 7, 0, -dir * 5, -8, -dir * 5, 8);
      this.tweens.add({ targets: arrow, x: arrow.x + dir * 5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return this.add.container(GAME_WIDTH / 2 + dir * 140, TAP_GUIDE_Y, [bg, ripple, hand, text, arrow]).setScrollFactor(0).setDepth(24);
    };
    this.tapGuide = [make(-1), make(1)];
  }

  /** Fades the tap guides and the swipe hint out together over the last stretch before TAP_GUIDE_METERS, then removes them. */
  private updateTapGuide(): void {
    if (this.tapGuide.length === 0 && !this.swipeHint) return;
    const hints = [...this.tapGuide, ...(this.swipeHint ? [this.swipeHint] : [])];
    const left = TAP_GUIDE_METERS - this.run.heightMeters;
    if (left <= 0) {
      hints.forEach((c) => {
        this.tweens.killTweensOf(c.list);
        c.destroy();
      });
      this.tapGuide = [];
      this.swipeHint = null;
      return;
    }
    hints.forEach((c) => c.setAlpha(Math.min(1, left / TAP_GUIDE_FADE_METERS)));
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
    bg.fillStyle(0xfff6e8, 0.62).fillRoundedRect(-w / 2, -h / 2, w, h, HINT_RADIUS);
    bg.lineStyle(2, 0xffffff, 0.85).strokeRoundedRect(-w / 2, -h / 2, w, h, HINT_RADIUS);
    const arrow = (dir: -1 | 1): Phaser.GameObjects.Graphics => {
      const g = this.add.graphics().setPosition(dir * (w / 2 - 24), 0);
      g.fillStyle(COLORS.primaryDark, 1).fillTriangle(dir * 7, 0, -dir * 5, -8, -dir * 5, 8);
      this.tweens.add({ targets: g, x: g.x + dir * 5, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return g;
    };
    const arrows = [arrow(-1), arrow(1)];
    this.swipeHint = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 60, [bg, text, ...arrows]).setScrollFactor(0).setDepth(25);
  }

  /**
   * `big` is for the finale announcements: a larger butter-yellow pill that pops in with a wobble and a burst of stars,
   * then pops away. It stays up under two seconds so it never hides the play area for long.
   */
  private showBanner(text: string, big = false, board?: BannerBoard): void {
    this.tweens.killTweensOf(this.banner);
    layoutBanner(this.bannerBg, this.bannerName, text, big, board);
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
  private createVimmyAnimations(): void {
    if (!this.anims.exists(VIMMY_FLY_ANIM)) {
      this.anims.create({
        key: VIMMY_FLY_ANIM,
        frames: [0, 1, 2, 3, 4].map((i) => ({ key: `vimmy-fly-${i}` })),
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

  /** A pop-up above Vimmy (see `popup` in ui/fx.ts). */
  private showPopup(message: string, stroke: string, big = false): void {
    popup(this, this.player.x, this.player.y, message, stroke, big);
  }

  /** Draw a light, friendly manga cut-in whose accent changes with the collected item. */
  private drawReactionCell(itemId: string): void {
    const accent = REACTION_CELL_ACCENT[itemId] ?? 0xffb300;
    const r = (accent >> 16) & 0xff;
    const g = (accent >> 8) & 0xff;
    const b = accent & 0xff;
    const paper = Phaser.Display.Color.GetColor(
      Math.round(r + (255 - r) * 0.86),
      Math.round(g + (255 - g) * 0.86),
      Math.round(b + (255 - b) * 0.86),
    );
    const cell = this.reactionFocus;
    const panel = (offsetX: number, offsetY: number): void => {
      cell.beginPath();
      cell.moveTo(-72 + offsetX, -52 + offsetY);
      cell.lineTo(55 + offsetX, -61 + offsetY);
      cell.lineTo(75 + offsetX, -13 + offsetY);
      cell.lineTo(62 + offsetX, 56 + offsetY);
      cell.lineTo(-57 + offsetX, 62 + offsetY);
      cell.lineTo(-76 + offsetX, 13 + offsetY);
      cell.closePath();
    };

    cell.clear();
    cell.fillStyle(0x000000, 0.14);
    panel(3, 5);
    cell.fillPath();
    cell.fillStyle(paper, 0.96);
    cell.lineStyle(4, accent, 0.95);
    panel(0, 0);
    cell.fillPath();
    cell.strokePath();

    // Short radial ink strokes stay at the edge, framing the face without covering it.
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14 + 0.08;
      const inner = i % 2 === 0 ? 51 : 56;
      const outer = i % 3 === 0 ? 70 : 66;
      cell.lineStyle(i % 3 === 0 ? 3 : 2, accent, i % 2 === 0 ? 0.62 : 0.42);
      cell.lineBetween(Math.cos(angle) * inner, Math.sin(angle) * inner * 0.78, Math.cos(angle) * outer, Math.sin(angle) * outer * 0.78);
    }

    if (itemId === 'dogEars') {
      // Paired blush hatching and nervous zigzags give the shy face its own manga shorthand.
      cell.lineStyle(3, 0xec407a, 0.55);
      for (const side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
          const x = side * (43 + i * 6);
          cell.lineBetween(x - side * 4, 29 + i * 3, x + side * 4, 19 + i * 3);
        }
        cell.beginPath();
        cell.moveTo(side * 42, -39);
        cell.lineTo(side * 48, -45);
        cell.lineTo(side * 43, -51);
        cell.strokePath();
      }
    }
  }

  /**
   * Hold a larger front-facing pose inside a comic cut-in. The source art stays untouched; this presentation
   * makes expressions made from only a handful of pixels readable while the player and backdrop move.
   */
  private playReaction(texture: string, holdMs: number, itemId: string, after: () => void): void {
    this.reactionTimer?.remove(false);
    this.tweens.killTweensOf(this.player);
    this.tweens.killTweensOf(this.reactionFocus);
    this.tweens.killTweensOf(this.reactionIcon);

    this.player.stop().setTexture(texture).setDisplaySize(PLAYER_SPRITE_SIZE, PLAYER_SPRITE_SIZE);
    this.drawReactionCell(itemId);
    this.reactionFocus
      .setPosition(this.player.x, this.player.y)
      .setAngle(itemId.length % 2 === 0 ? -2 : 2)
      .setVisible(true)
      .setAlpha(0)
      .setScale(0.72);

    this.tweens.add({ targets: this.player, displayWidth: PLAYER_REACTION_SIZE, displayHeight: PLAYER_REACTION_SIZE, duration: 150, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.reactionFocus, alpha: 0.92, scale: 1, duration: 150, ease: 'Back.easeOut' });
    const iconKey = emojiTextureKey(REACTION_ICON[itemId] ?? '');
    this.reactionIcon.setVisible(false);
    if (this.textures.exists(iconKey)) {
      this.reactionIcon.setTexture(iconKey).setPosition(this.player.x, this.player.y - REACTION_ICON_OFFSET).setVisible(true).setAlpha(0).setScale(0.3 * REACTION_ICON_SCALE);
      this.tweens.add({ targets: this.reactionIcon, alpha: 1, scale: 1.2 * REACTION_ICON_SCALE, duration: 220, ease: 'Back.easeOut' });
    }

    this.reactionTimer = this.time.delayedCall(holdMs, () => {
      this.reactionTimer = undefined;
      if (!this.player.active || this.ended) return;
      this.tweens.add({
        targets: this.player,
        displayWidth: PLAYER_SPRITE_SIZE,
        displayHeight: PLAYER_SPRITE_SIZE,
        duration: 170,
        ease: 'Cubic.easeIn',
        onComplete: after,
      });
      this.tweens.add({
        targets: this.reactionFocus,
        alpha: 0,
        scale: 1.12,
        duration: 170,
        ease: 'Cubic.easeIn',
        onComplete: () => this.reactionFocus.setVisible(false),
      });
      this.tweens.add({ targets: this.reactionIcon, alpha: 0, scale: 0.6 * REACTION_ICON_SCALE, duration: 170, onComplete: () => this.reactionIcon.setVisible(false) });
    });
  }

  /** Briefly turn Vimmy toward the player when she collects one of the five buffs. */
  private playBuffReaction(item: ItemDef): void {
    const texture = BUFF_REACTION_TEXTURE[item.id];
    if (!texture || this.isFlipping || this.swipeDashDir !== 0) return;

    this.playReaction(texture, item.id === 'helicopter' ? REACTION_HELICOPTER_HOLD_MS : item.id === 'goldenRetriever' ? REACTION_GOLDEN_HOLD_MS : REACTION_HOLD_MS, item.id, () => {
      if (item.id === 'helicopter') this.playHelicopterFlip();
      else this.player.play(VIMMY_FLY_ANIM);
    });
  }

  /** Show the compact reaction face assigned to this debuff. */
  private playDebuffReaction(item: ItemDef): void {
    const texture = DEBUFF_REACTION_TEXTURE[item.id];
    if (!texture || this.isFlipping || this.swipeDashDir !== 0) return;

    this.playReaction(texture, item.id === 'carCrash' ? REACTION_CRASH_HOLD_MS : REACTION_HOLD_MS, item.id, () => this.player.play(VIMMY_FLY_ANIM));
    if (item.id === 'planner') playSfx(this, 'disappointed', 1, 0.025);
  }

  /** Swap the backdrop and announce the zone when the dog climbs past a milestone. */
  private updateZone(): void {
    const finale = finaleAt(this.run.heightMeters);
    if (finale && finale.zoneId !== this.finaleZone) {
      this.showBanner(tDynamic(`finale.${finale.zoneId}`, ''), true, FINALE_BOARD[finale.zoneId]); // some finales are announced on a signboard of their own
      playSfx(this, 'power', 0.75);
      this.cameras.main.flash(180, 247, 189, 59, false);
      this.finaleGiven = 0;
      this.finaleDropped = 0;
    }
    this.finaleZone = finale?.zoneId ?? null;
    this.finaleFrame.setVisible(!!finale);
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
    if (this.ended || this.run.isStunned || this.isFlipping || this.swipeDashDir !== 0 || (!ADMIN && this.swipesLeft <= 0)) return;
    if (!ADMIN) this.swipesLeft--; // admin has unlimited side dashes
    playSfx(this, 'dash', 0.6);
    const spent = this.swipeBreads[ADMIN ? 0 : this.swipesLeft];
    this.tweens.add({ targets: spent, scale: spent.scale * 1.6, duration: 120, yoyo: true });
    const steer = this.run.isDisoriented ? -dir : dir;
    this.swipeDashDir = steer as -1 | 1;
    this.reactionTimer?.remove(false);
    this.reactionTimer = undefined;
    this.tweens.killTweensOf(this.player);
    this.tweens.killTweensOf(this.reactionFocus);
    this.reactionFocus.setVisible(false);
    this.tweens.killTweensOf(this.reactionIcon);
    this.reactionIcon.setVisible(false);
    this.player.setDisplaySize(PLAYER_SPRITE_SIZE, PLAYER_SPRITE_SIZE);
    this.player.stop().setTexture(DASH_TEXTURE[String(steer) as '-1' | '1']);
    this.vx = 0;
    this.vy = 0;
    this.dashTrailMs = 0;
    dashBurst(this, this.player.x, this.player.y, steer as -1 | 1);
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
    const fumble = this.run.shyMs > 0 ? this.run.shyLiftMin + Math.random() * (this.run.shyLiftMax - this.run.shyLiftMin) : 1; // dog ears: shy, fumbling flaps
    this.vy = PHYSICS.flapVelocity * power * slow * finaleLift * fumble;
    playSfx(this, 'flap', 0.5, 0.12);
    const steer = this.run.isDisoriented ? -dir : dir; // disoriented: left/right swapped
    this.vx = steer * PHYSICS.driftVelocity * slow
  }

  update(time: number, deltaMs: number): void {
    if (this.ended || this.paused) return;
    const dt = Math.min(deltaMs, 66) / 1000; // clamp so a tab switch can't teleport the player; high enough that 30 fps (Low Power Mode) stays at full speed
    this.run.tick(dt * 1000);

    this.movePlayer(dt);
    this.updateCamera(dt);
    this.updateZone();
    this.spawnItems(dt * 1000);
    this.updateItems(dt);
    this.updateHud();
    this.updateTapGuide();
    this.updateCopterSound();
    this.updateShieldAura(time);
    this.updatePowerAura(time, dt * 1000);
    if (this.reactionFocus.visible) this.reactionFocus.setPosition(this.player.x, this.player.y);
    if (this.reactionIcon.visible) this.reactionIcon.setPosition(this.player.x, this.player.y - REACTION_ICON_OFFSET + Math.sin(time / 90) * 3);

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
      this.dashTrailMs -= dt * 1000;
      if (this.dashTrailMs <= 0) {
        dashTrail(this, this.player.texture.key, this.player.x, this.player.y, this.swipeDashDir, PLAYER_SPRITE_SIZE);
        this.dashTrailMs = 32;
      }
      this.player.x = this.swipeDashDir < 0 ? Math.max(target, this.player.x - step) : Math.min(target, this.player.x + step);
      if (this.player.x === target) {
        dashImpact(this, this.player.x, this.player.y, this.swipeDashDir, PLAYER_SPRITE_SIZE);
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
      this.climbLinesMs -= dt * 1000;
      if (this.climbLinesMs <= 0) {
        climbSpeedLines(this, this.player.x, this.player.y, PLAYER_SPRITE_SIZE);
        this.climbLinesMs = 120;
      }
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

  /** A scrolling backdrop tile, a little bigger than the screen, Its blur filter is only created once the blur is needed. */
  private makeBackdrop(textureKey: string, depth: number): Phaser.GameObjects.TileSprite {
    const sprite = this.add
      .tileSprite(-BG_BLEED, -BG_BLEED, GAME_WIDTH + BG_BLEED * 2, GAME_HEIGHT + BG_BLEED * 2, textureKey)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(depth);
    sprite.tilePositionX = -BG_BLEED; // keeps the pattern where it was before the bleed
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
    if (level <= 0.01) {
      if (sprite.filters) sprite.renderFilters = false;
      return;
    }
    // The opening stretch is sharp, so no filter (and none of its drawing cost) exists until the first speed-up.
    if (!sprite.filters) {
      sprite.enableFilters();
      sprite.filters!.internal.addBlur(0, 0, 0, 1);
    }
    sprite.renderFilters = true;
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
    const finale = finaleAt(h);
    // A fixed-total finale (the bakery's 40 loaves) drops on a schedule by height instead of on the random timer.
    if (finale?.totalDrops) {
      let row = 0;
      while (this.finaleDropped < finale.totalDrops && h >= finale.fromMeters + (FINALE_METERS * this.finaleDropped) / finale.totalDrops) {
        this.spawnOne(h, row++);
        this.finaleDropped += 1;
      }
      this.spawnTimerMs = 0;
      return;
    }
    this.spawnTimerMs = ramp(ITEM_RULES.spawnMs, d) * (finale ? FINALE_RUSH.spawnIntervalScale : 1);

    this.spawnOne(h, 0);
    const doubleChance = Math.min(1, ramp(ITEM_RULES.doubleSpawnChance, d) + (finale ? FINALE_RUSH.extraDoubleSpawnChance : 0));
    if (Math.random() < doubleChance) this.spawnOne(h, 1);
    // A flood finale (coffee rush, shopping spree) piles extra signature items on top of every beat.
    if (finale?.flood) {
      for (let row = 3; row <= 4; row++) if (Math.random() < finale.flood.extraChance) this.spawnOne(h, row, undefined, finale.flood.id);
    }
    const { untilMeters, extraChance } = ITEM_RULES.startFood;
    if (h < untilMeters && Math.random() < extraChance * (1 - h / untilMeters)) this.spawnOne(h, 2, 'points');
  }

  private spawnOne(heightMeters: number, row: number, onlyKind?: ItemDef['kind'], forceId?: string): void {
    const flood = finaleAt(heightMeters)?.flood;
    const flooded = !onlyKind && flood && Math.random() < flood.chance ? flood.id : undefined;
    const def = ((forceId ?? flooded) && getItem((forceId ?? flooded) as string)) || pickItem(heightMeters, Math.random, onlyKind);
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

      if (this.run.magnetMs > 0 && it.def.kind !== 'debuff') this.pullToward(it, dt);

      it.halo?.setPosition(s.x, s.y);

      const reach = (PLAYER_HITBOX_SIZE + Math.max(ITEM_RULES.size, it.visualSize * 0.75)) / 2;
      if (Math.abs(s.x - this.player.x) < reach && Math.abs(s.y - this.player.y) < reach) {
        if (this.swipeDashDir !== 0) {
          // The sideways dash is too fast to grab anything but the helicopter, which cuts the dash short and takes off at once.
          if (it.def.id !== 'helicopter') continue;
          this.swipeDashDir = 0;
          this.vx = 0;
          this.player.play(VIMMY_FLY_ANIM);
        }
        if (it.def.kind === 'debuff' && this.run.dashMs > 0) continue; // helicopter: debuffs pass through harmlessly (admin takes them too, to see the effects)
        if (it.def.kind === 'buff') {
          this.playBuffReaction(it.def);
          const cue = BUFF_AUDIO_CUE[it.def.id] ?? { effect: 0.7, yips: 0.5 };
          playSfx(this, itemSfx(it.def.id, 'buff'), cue.effect);
          playSfx(this, 'yips', cue.yips, 0.08);
          this.showPopup(tDynamic(`buff.${it.def.id}`, itemName(it.def.id, it.def.label)), hex(COLORS.buff));
        } else if (it.def.kind === 'debuff' && this.run.shield) {
          // The lawyer suit takes the hit: say so instead of announcing the debuff.
          this.showPopup(t('shield.blocked'), '#1565c0', true);
          playSfx(this, 'block', 0.9);
          this.burstShield();
        } else if (it.def.kind === 'debuff') {
          const big = it.def.id === 'carCrash' || it.def.id === 'planner';
          this.showPopup(tDynamic(`debuff.${it.def.id}`, itemName(it.def.id, it.def.label)), hex(COLORS.debuff), big);
          if (it.def.id === 'carCrash') this.cameras.main.shake(420, 0.018);
          else if (it.def.id === 'planner') this.cameras.main.shake(240, 0.008);
          playSfx(this, itemSfx(it.def.id, 'debuff'), DEBUFF_AUDIO_VOLUME[it.def.id] ?? 0.7);
          if (SMELLY_BREADS.has(it.def.id)) playSfx(this, 'sniff', it.def.id === 'fishSauceBread' ? 0.7 : 0.52, 0.06);
        }
        const swerveDir = Math.random() < 0.5 ? -1 : 1; // the kitten shoves Vimmy a random way, not necessarily away from it
        const pointsBefore = this.run.itemPoints;
        const applied = this.run.collect(it.def);
        const gained = this.run.itemPoints - pointsBefore;
        if (it.def.kind === 'points' && gained > 0) {
          playSfx(this, itemSfx(it.def.id, 'points', gained), 0.7, 0.06);
          if (itemSfx(it.def.id, 'points', gained) !== 'point') playSfx(this, 'point', 0.4, 0.1);
        }
        if (it.def.kind !== 'points' && it.def.bonusPoints && gained > 0) {
          // The golden retriever and the dog ears carry points as well: they pop up just after the item's own text.
          playSfx(this, 'jackpot', 0.7, 0.06);
          this.time.delayedCall(350, () => this.showPopup(`+${gained}`, hex(COLORS.primaryDark), true));
        }
        if (it.def.refillsDash && this.swipesLeft < PHYSICS.swipeDashesPerRun) {
          // The bread gives a sideways dash back: the spent loaf in the corner lights up again.
          this.swipesLeft += 1;
          const loaf = this.swipeBreads[this.swipesLeft - 1];
          this.tweens.add({ targets: loaf, scale: loaf.scale * 1.7, duration: 160, yoyo: true });
          playSfx(this, 'sparkle', 0.6, 0.1);
          this.time.delayedCall(350, () => this.showPopup(t('hud.dashPlus'), hex(COLORS.buff)));
        }
        if (it.def.kind === 'points' && gained !== 0) this.showPopup(`${gained > 0 ? '+' : ''}${gained}`, gained > 0 ? hex(COLORS.primaryDark) : hex(COLORS.debuff), gained >= 150);
        if (it.def.kind === 'debuff' && applied) this.playDebuffReaction(it.def);
        if (this.run.pendingSwerve > 0) {
          this.vx = swerveDir * this.run.pendingSwerve;
          this.run.pendingSwerve = 0;
        }
        this.remove(it);
      } else if (s.y > cam.scrollY + GAME_HEIGHT + 60) {
        this.remove(it);
      }
    }
  }

  /** Golden retriever magnet: nearby food and power-ups drift toward Vimmy, faster the closer they get. Debuffs ignore it. */
  private pullToward(it: FallingItem, dt: number): void {
    const dx = this.player.x - it.shape.x;
    const dy = this.player.y - it.shape.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.run.magnetRadius || dist < 1) return;
    const speed = MAGNET_SPEED * (1.4 - dist / this.run.magnetRadius);
    const step = Math.min(dist, speed * dt);
    it.shape.x += (dx / dist) * step;
    it.shape.y += (dy / dist) * step;
    it.baseX = it.shape.x;
  }

  /** Keeps the shield bubble on Vimmy, gently pulsing, for as long as the shield lasts. */
  private updateShieldAura(timeMs: number): void {
    const on = this.run.shield;
    this.shieldAura.setVisible(on);
    if (!on) return;
    const { x, y } = this.player;
    const g = this.shieldAura;
    g.clear();
    // A cloud of twinkling little shields drifting around the body on two orbits.
    const count = 9;
    for (let i = 0; i < count; i++) {
      const outer = i % 3 !== 0;
      const a = (outer ? timeMs / 800 : -timeMs / 550) + (i * Math.PI * 2) / count;
      const r = PLAYER_SPRITE_SIZE * (outer ? 0.74 : 0.5) * (1 + 0.06 * Math.sin(timeMs / 300 + i));
      const twinkle = 0.5 + 0.5 * Math.sin(timeMs / 140 + i * 1.7);
      this.drawMiniShield(g, x + Math.cos(a) * r, y + Math.sin(a) * r, 6 + 5 * twinkle, i % 2 ? 0xffffff : 0x81d4fa, 0x0288d1, 0.8 + 0.2 * twinkle);
    }
  }

  /** The points of a little heater-shaped shield centred on (x, y), `s` px from the centre to the top and about `s` to each side. */
  private shieldPoints(x: number, y: number, s: number): Phaser.Math.Vector2[] {
    return [[-0.85, -0.8], [0, -1], [0.85, -0.8], [0.85, 0.1], [0.55, 0.65], [0, 1.1], [-0.55, 0.65], [-0.85, 0.1]].map(([px, py]) => new Phaser.Math.Vector2(x + px * s, y + py * s));
  }

  /** A tiny filled shield with an outline, for the shield's twinkling cloud. */
  private drawMiniShield(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number, color: number, outline: number, alpha: number): void {
    const points = this.shieldPoints(x, y, s);
    g.fillStyle(color, alpha).fillPoints(points, true);
    g.lineStyle(2, outline, alpha).strokePoints(points, true, true);
  }

  /** Power fly: golden sparkles streaming upward from the body. */
  private updatePowerAura(_timeMs: number, deltaMs: number): void {
    if (this.run.strongFlapMs <= 0) return;
    this.powerEmberMs -= deltaMs;
    if (this.powerEmberMs > 0) return;
    this.powerEmberMs = 40;
    const angle = Math.random() * Math.PI * 2;
    const reach = PLAYER_SPRITE_SIZE * (0.3 + Math.random() * 0.35);
    const size = 9 + Math.random() * 8;
    const spark = this.add
      .star(this.player.x + Math.cos(angle) * reach, this.player.y + Math.sin(angle) * reach, 4, size * 0.3, size, Math.random() < 0.5 ? 0xffd54f : 0xffab00)
      .setStrokeStyle(2, 0xe65100, 1)
      .setDepth(4.2);
    this.tweens.add({
      targets: spark,
      x: spark.x + (Math.random() - 0.5) * 30,
      y: spark.y - 55 - Math.random() * 45,
      alpha: 0,
      scale: 0.2,
      angle: 90,
      duration: 450 + Math.random() * 250,
      ease: 'Cubic.easeOut',
      onComplete: () => spark.destroy(),
    });
  }

  /** The bubble pops outward when the shield takes a hit. */
  private burstShield(): void {
    // A burst of little shields flies off, as if the hit glanced away.
    const sparks = 10;
    for (let i = 0; i < sparks; i++) {
      const angle = (i / sparks) * Math.PI * 2 + Math.random() * 0.3;
      const spark = this.add.graphics().setPosition(this.player.x, this.player.y).setDepth(7);
      this.drawMiniShield(spark, 0, 0, 10, i % 2 ? 0xffffff : 0x81d4fa, 0x0288d1, 1);
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
    if (this.finaleFrame.visible) this.finaleFrame.setAlpha(0.42 + Math.sin(this.time.now / 130) * 0.2);
    // Bar showing progress toward the next location.
    const next = ZONES[ZONES.indexOf(this.zone) + 1];
    const fraction = next ? Phaser.Math.Clamp((this.run.heightMeters - this.zone.fromMeters) / (next.fromMeters - this.zone.fromMeters), 0, 1) : 1;
    this.progressGfx.clear();
    this.progressGfx.fillStyle(COLORS.border, 1).fillRoundedRect(92, 55, 70, 8, 4);
    if (fraction > 0) this.progressGfx.fillStyle(COLORS.primary, 1).fillRoundedRect(92, 55, Math.max(8, 70 * fraction), 8, 4).lineStyle(1.5, COLORS.primaryDark, 1).strokeRoundedRect(92, 55, Math.max(8, 70 * fraction), 8, 4);
    if (score !== this.lastScore) {
      // Pop and flash green on a gain, red on a loss.
      this.scoreText.setColor(score > this.lastScore ? hex(COLORS.buff) : hex(COLORS.debuff));
      this.tweens.killTweensOf(this.scoreText);
      this.scoreText.setScale(1.3);
      this.tweens.add({ targets: this.scoreText, scale: 1, duration: 250, ease: 'Back.easeOut', onComplete: () => this.scoreText.setColor(hex(COLORS.text)) });
      this.lastScore = score;
    }
    this.swipeBreads.forEach((b, i) => b.setAlpha(i < this.swipesLeft ? 1 : 0.2));

    const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
    const chips: { icon: string; label: string; color: number }[] = [];
    if (this.run.shield) chips.push({ icon: STATUS_ICON.shield, label: `${t('hud.shield')}`, color: COLORS.buff });
    if (this.run.dashMs > 0) chips.push({ icon: STATUS_ICON.dash, label: `${t('hud.dash')} ${secs(this.run.dashMs)}`, color: COLORS.buff });
    if (this.run.strongFlapMs > 0) chips.push({ icon: STATUS_ICON.power, label: `${t('hud.power')} ${secs(this.run.strongFlapMs)}`, color: COLORS.buff });
    if (this.run.doublePointsMs > 0) chips.push({ icon: STATUS_ICON.x2, label: `${t('hud.x2')} ${secs(this.run.doublePointsMs)}`, color: COLORS.buff });
    if (this.run.magnetMs > 0) chips.push({ icon: STATUS_ICON.magnet, label: `${t('hud.magnet')} ${secs(this.run.magnetMs)}`, color: COLORS.buff });
    if (this.run.isStunned) chips.push({ icon: STATUS_ICON.stunned, label: `${t('hud.stunned')} ${secs(this.run.stunMs)}`, color: COLORS.debuff });
    if (this.run.isDisoriented) chips.push({ icon: STATUS_ICON.dizzy, label: `${t('hud.dizzy')} ${secs(this.run.disorientMs)}`, color: COLORS.debuff });
    if (this.run.shyMs > 0) chips.push({ icon: STATUS_ICON.shy, label: `${t('hud.shy')} ${secs(this.run.shyMs)}`, color: COLORS.debuff });
    if (this.run.slowMs > 0) chips.push({ icon: STATUS_ICON.slow, label: `${t('hud.slow')} ${secs(this.run.slowMs)}`, color: COLORS.debuff });

    this.chipGfx.clear();
    let y = 88;
    this.chipTexts.forEach((txt, i) => {
      const chip = chips[i];
      this.chipIcons[i].setVisible(false);
      txt.setVisible(false);
      if (!chip) return;
      drawStatusChip(this.chipGfx, this.chipIcons[i], txt, 8, y, chip);
      y += 28;
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
