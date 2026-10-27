import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { getItem, priceLabel } from '../items/itemDefs';
import { SHOW, countdownText } from '../promo/config';
import { COLORS } from '../ui/theme';
import { TAB_BAR_HEIGHT, button, label, roundedBox, tabBar } from '../ui/widgets';

// Items shown as "popular" on the storefront.
const POPULAR = ['goldenRetriever', 'shrimpFriedRiceBox', 'pandanCustardBread'];

/** Bakery storefront: the home screen, laid out like a shop page in a food-ordering app. */
export class HomeScene extends Phaser.Scene {
  constructor() {
    super(SCENES.home);
  }

  create(): void {
    this.drawBanner();
    this.drawShopInfo();
    this.drawCountdown();
    this.drawPopular();
    button(this, GAME_WIDTH / 2, GAME_HEIGHT - TAB_BAR_HEIGHT - 56, 420, 68, 'Order now', () =>
      this.scene.start(SCENES.game),
    );
    tabBar(this, 'store');
  }

  /** Key-art banner. Placeholder block until the real art exists. */
  private drawBanner(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, 230, COLORS.primary).setOrigin(0);
    this.add.rectangle(0, 200, GAME_WIDTH, 30, COLORS.primaryDark).setOrigin(0).setAlpha(0.35);
    label(this, GAME_WIDTH / 2, 100, SHOW.title, { size: 44, color: 0xffffff, bold: true }).setOrigin(0.5);
    label(this, GAME_WIDTH / 2, 150, 'key art banner goes here', { size: 14, color: 0xffffff }).setOrigin(0.5).setAlpha(0.7);
  }

  private drawShopInfo(): void {
    roundedBox(this, 20, 190, GAME_WIDTH - 40, 86, COLORS.surface, 16, COLORS.border);
    label(this, 36, 204, `${SHOW.title} Bakery`, { size: 24, bold: true });
    label(this, 36, 240, '★ 4.9   ·   Open now   ·   Bakery & lunch boxes', { size: 15, color: COLORS.muted });
  }

  private drawCountdown(): void {
    roundedBox(this, 20, 294, GAME_WIDTH - 40, 48, 0xffe0b2, 24);
    label(this, GAME_WIDTH / 2, 318, countdownText(), { size: 18, bold: true, color: COLORS.primaryDark }).setOrigin(0.5);
  }

  private drawPopular(): void {
    label(this, 20, 364, 'Popular menu', { size: 22, bold: true });
    const cardW = 138;
    const gap = 13;
    POPULAR.forEach((id, i) => {
      const item = getItem(id);
      if (!item) return;
      const x = 20 + i * (cardW + gap);
      const y = 402;
      roundedBox(this, x, y, cardW, 160, COLORS.surface, 14, COLORS.border);
      this.add.circle(x + cardW / 2, y + 44, 30, item.color).setStrokeStyle(3, COLORS.points);
      label(this, x + cardW / 2, y + 92, item.label, { size: 14, bold: true, wrap: cardW - 16, align: 'center' }).setOrigin(0.5, 0);
      label(this, x + cardW / 2, y + 144, priceLabel(item), { size: 18, bold: true, color: COLORS.primary }).setOrigin(0.5);
    });
  }
}
