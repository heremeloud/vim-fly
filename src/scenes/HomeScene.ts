import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import { displayName, getItem, priceLabel } from '../items/itemDefs';
import { PILOT, SHOW, countdownText, openLink } from '../promo/config';
import { APP, SERVICES } from '../ui/brand';
import { COLORS } from '../ui/theme';
import { TAB_BAR_HEIGHT, button, hitArea, label, languageButton, roundedBox, tabBar } from '../ui/widgets';

// Items shown as "popular" on the storefront.
const POPULAR = ['goldenRetriever', 'shrimpFriedRiceBox', 'pandanCustardBread'];

/** Bakery storefront: the home screen, laid out like a shop page in a food-ordering app. */
export class HomeScene extends Phaser.Scene {
  constructor() {
    super(SCENES.home);
  }

  create(): void {
    this.drawBanner();
    this.drawServices();
    this.drawCountdown();
    this.drawPopular();
    button(this, GAME_WIDTH / 2, GAME_HEIGHT - TAB_BAR_HEIGHT - 56, 420, 68, t('home.orderNow'), () =>
      this.scene.start(SCENES.game),
    );
    tabBar(this, 'store');
  }

  /** App header and key-art banner: deliver-to line, language button, search bar, app name. Banner art is a placeholder. */
  private drawBanner(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, 230, COLORS.primary).setOrigin(0);
    this.add.rectangle(0, 200, GAME_WIDTH, 30, COLORS.primaryDark).setOrigin(0).setAlpha(0.25);
    label(this, 20, 12, `${t('app.deliverTo')}  ${t('app.currentLocation')}  ▾`, { size: 15, color: COLORS.onPrimary, bold: true });
    languageButton(this, GAME_WIDTH - 20, 12);

    roundedBox(this, 20, 42, GAME_WIDTH - 40, 44, COLORS.surface, 22);
    label(this, 40, 52, '🔍', { size: 18 });
    label(this, 72, 53, t('app.searchHint'), { size: 15, color: COLORS.muted });
    hitArea(this, 20, 42, GAME_WIDTH - 40, 44, () => this.scene.start(SCENES.menu));

    label(this, GAME_WIDTH / 2, 124, `🐝 ${APP.name} 🐶`, { size: 42, color: COLORS.onPrimary, bold: true }).setOrigin(0.5);
    label(this, GAME_WIDTH / 2, 162, t('app.tagline'), { size: 16, color: COLORS.onPrimary }).setOrigin(0.5);
  }

  /** Super-app style grid of services under the banner. Only the first leads anywhere real. */
  private drawServices(): void {
    roundedBox(this, 20, 190, GAME_WIDTH - 40, 86, COLORS.surface, 16, COLORS.border);
    const w = (GAME_WIDTH - 40) / SERVICES.length;
    SERVICES.forEach((svc, i) => {
      const cx = 20 + i * w + w / 2;
      label(this, cx, 220, svc.icon, { size: 28 }).setOrigin(0.5);
      label(this, cx, 252, t(svc.labelKey), { size: 14, bold: true }).setOrigin(0.5);
      hitArea(this, 20 + i * w, 190, w, 86, () => {
        if (svc.target === 'menu') this.scene.start(SCENES.menu);
        else this.scene.start(SCENES.comingSoon, { title: t(svc.labelKey), note: svc.note ? t(svc.note) : '', tab: 'store' });
      });
    });
  }

  /** Under the tiles: the countdown once an air date is set, otherwise a link to the pilot. */
  private drawCountdown(): void {
    roundedBox(this, 20, 294, GAME_WIDTH - 40, 48, 0xffecb3, 24);
    const hasAirDate = SHOW.airDate !== null;
    const text = hasAirDate ? countdownText() : t('home.watchPilot');
    label(this, GAME_WIDTH / 2, 318, text, { size: 18, bold: true, color: COLORS.accent }).setOrigin(0.5);
    if (!hasAirDate) hitArea(this, 20, 294, GAME_WIDTH - 40, 48, () => openLink(PILOT.url));
  }

  private drawPopular(): void {
    label(this, 20, 364, APP.shopName, { size: 22, bold: true });
    label(this, GAME_WIDTH - 20, 370, `★ 4.9  ·  ${t('home.open')}`, { size: 14, color: COLORS.muted }).setOrigin(1, 0);
    const cardW = 138;
    const gap = 13;
    POPULAR.forEach((id, i) => {
      const item = getItem(id);
      if (!item) return;
      const x = 20 + i * (cardW + gap);
      const y = 402;
      roundedBox(this, x, y, cardW, 160, COLORS.surface, 14, COLORS.border);
      this.add.circle(x + cardW / 2, y + 44, 30, item.color).setStrokeStyle(3, COLORS.points);
      label(this, x + cardW / 2, y + 92, displayName(item), { size: 14, bold: true, wrap: cardW - 16, align: 'center' }).setOrigin(0.5, 0);
      label(this, x + cardW / 2, y + 144, priceLabel(item), { size: 18, bold: true, color: COLORS.accent }).setOrigin(0.5);
    });
  }
}
