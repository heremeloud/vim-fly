import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import { displayName, ITEMS, priceLabel, type ItemDef } from '../items/itemDefs';
import { addItemSprite, itemDisplaySize } from '../items/itemSprite';
import { OFFICIAL, PILOT, SHOW, countdownText, openLink, profileUrl } from '../promo/config';
import youtubeIcon from '../assets/icons/youtube.svg?no-inline';
import { APP, SERVICES } from '../ui/brand';
import { startOrder } from '../ui/onboarding';
import { openSettings } from '../ui/settings';
import { drawIcon } from '../ui/icons';
import { COLORS, RADIUS } from '../ui/theme';
import { TAB_BAR_HEIGHT, button, hitArea, itemTile, label, languageButton, roundedBox, tabBar } from '../ui/widgets';

const POPULAR_COUNT = 3;

/** Three different priced items (points items only, no buffs or debuffs), picked at random each time the home screen opens. */
function pickPopular(): ItemDef[] {
  return Phaser.Utils.Array.Shuffle(ITEMS.filter((i) => i.kind === 'points' && !i.secret)).slice(0, POPULAR_COUNT);
}

/** Bakery storefront: the home screen, laid out like a shop page in a food-ordering app. */
export class HomeScene extends Phaser.Scene {
  /** The YouTube icon (shared with the Promos page, which loads the same texture key). */
  preload(): void {
    if (!this.textures.exists('icon-youtube')) this.load.svg('icon-youtube', youtubeIcon, { width: 128, height: 128 });
  }

  constructor() {
    super(SCENES.home);
  }

  create(): void {
    this.drawBanner();
    this.drawServices();
    this.drawCountdown();
    this.drawPopular();
    button(this, GAME_WIDTH / 2, GAME_HEIGHT - TAB_BAR_HEIGHT - 56, 420, 68, t('home.orderNow'), () => startOrder(this));
    tabBar(this, 'store');
  }

  /** App header and key-art banner: deliver-to line (opens settings), language button, search bar, app name. */
  private drawBanner(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, 230, COLORS.primary).setOrigin(0);
    const deliverTo = label(this, 20, 12, t('app.deliverTo'), { size: 15, color: COLORS.onPrimary, bold: true });
    const gearX = deliverTo.x + deliverTo.width + 20;
    drawIcon(this, 'gear', gearX, 23, COLORS.onPrimary, { width: 1.8 }).setScale(0.85);
    drawIcon(this, 'chevronDown', gearX + 18, 23, COLORS.onPrimary, { width: 1.8 }).setScale(0.8);
    hitArea(this, 10, 6, gearX + 34, 34, () => openSettings(this));
    languageButton(this, GAME_WIDTH - 20, 12);

    roundedBox(this, 20, 42, GAME_WIDTH - 40, 44, COLORS.surface, RADIUS.control);
    drawIcon(this, 'search', 50, 64, COLORS.muted);
    label(this, 72, 53, t('app.searchHint'), { size: 15, color: COLORS.muted });
    hitArea(this, 20, 42, GAME_WIDTH - 40, 44, () => this.scene.start(SCENES.menu));

    // The lockup: name and slogan left-aligned on the left, the rider on the right resting on the tiles' top edge.
    label(this, 24, 98, APP.name, { size: 40, color: COLORS.onPrimary, bold: true, display: true, maxWidth: 300 });
    label(this, 24, 148, t('app.tagline'), { size: 15, color: COLORS.onPrimary, maxWidth: 300 });
    const BIKE = 96; // 1.5x the 64 px art, drawn with nearest-neighbour filtering so the pixels stay crisp
    this.textures.get('vimmy-header-delivery-bike').setFilter(Phaser.Textures.FilterMode.NEAREST);
    const bx = GAME_WIDTH - 24 - BIKE;
    const g = this.add.graphics();
    g.lineStyle(3, COLORS.primaryDark, 0.55);
    [[-6, 44], [-14, 56], [-4, 68]].forEach(([dx, dy], i) => g.lineBetween(bx + dx - 26 + i * 4, 94 + dy, bx + dx - 4, 94 + dy)); // speed lines
    this.add.image(bx, 190, 'vimmy-header-delivery-bike').setOrigin(0, 1).setDisplaySize(BIKE, BIKE);
  }

  /** Super-app style grid of shortcuts under the banner (Food, Mart, Express, Ride). */
  private drawServices(): void {
    roundedBox(this, 20, 190, GAME_WIDTH - 40, 86, COLORS.surface, RADIUS.card, COLORS.border);
    const w = (GAME_WIDTH - 40) / SERVICES.length;
    SERVICES.forEach((svc, i) => {
      const cx = 20 + i * w + w / 2;
      roundedBox(this, cx - 22, 198, 44, 44, COLORS[svc.tint], RADIUS.control);
      drawIcon(this, svc.icon, cx, 220, COLORS.onPrimary);
      label(this, cx, 258, t(svc.labelKey), { size: 14, bold: true, maxWidth: w - 8 }).setOrigin(0.5);
      hitArea(this, 20 + i * w, 190, w, 86, () => {
        switch (svc.target) {
          case 'menu':
            this.scene.start(SCENES.menu);
            break;
          case 'promos':
            this.scene.start(SCENES.promos);
            break;
          case 'pilot':
            this.scene.start(SCENES.promos);
            break;
          case 'official':
            openLink(profileUrl('x', OFFICIAL.handles.x));
            break;
          case 'viewmim':
            openLink('https://viewmim.info/projects/bake-love-feeling');
            break;
          case 'play':
            startOrder(this);
            break;
        }
      });
    });
  }

  /** Under the tiles: the countdown once an air date is set, otherwise a link that opens the pilot on YouTube. */
  private drawCountdown(): void {
    roundedBox(this, 20, 294, GAME_WIDTH - 40, 48, COLORS.primarySoft, RADIUS.card);
    const hasAirDate = SHOW.airDate !== null;
    const text = hasAirDate ? countdownText() : t('home.watchPilot');
    const txt = label(this, GAME_WIDTH / 2, 318, text, { size: 18, bold: true, color: COLORS.accent }).setOrigin(0.5);
    if (!hasAirDate && this.textures.exists('icon-youtube')) {
      // YouTube icon to the left of the text, the pair centred in the pill.
      const ICON = 24;
      const GAP = 8;
      const startX = GAME_WIDTH / 2 - (ICON + GAP + txt.width) / 2;
      this.add.image(startX + ICON / 2, 318, 'icon-youtube').setDisplaySize(ICON, ICON);
      txt.setOrigin(0, 0.5).setX(startX + ICON + GAP);
    }
    if (!hasAirDate) hitArea(this, 20, 294, GAME_WIDTH - 40, 48, () => openLink(PILOT.url));
  }

  private drawPopular(): void {
    label(this, 20, 364, APP.shopName, { size: 22, bold: true, maxWidth: 300 });
    label(this, GAME_WIDTH - 20, 370, `●  ${t('home.open')}`, { size: 14, color: COLORS.buff, bold: true }).setOrigin(1, 0);
    const cardW = 138;
    const gap = 13;
    pickPopular().forEach((item, i) => {
      const x = 20 + i * (cardW + gap);
      const y = 402;
      roundedBox(this, x, y, cardW, 160, COLORS.surface, RADIUS.card, COLORS.border);
      itemTile(this, x + cardW / 2, y + 44, 64, COLORS.points);
      addItemSprite(this, x + cardW / 2, y + 44, item, itemDisplaySize(item.id, 48));
      label(this, x + cardW / 2, y + 92, displayName(item), { size: 14, bold: true, wrap: cardW - 16, align: 'center' }).setOrigin(0.5, 0);
      label(this, x + cardW / 2, y + 144, priceLabel(item), { size: 18, bold: true, color: COLORS.accent }).setOrigin(0.5);
    });
  }
}
