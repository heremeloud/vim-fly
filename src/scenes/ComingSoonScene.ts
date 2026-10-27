import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { COLORS } from '../ui/theme';
import { label, tabBar, type TabId } from '../ui/widgets';

/** Placeholder for tabs that are not built yet (Orders, Promos). */
export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super(SCENES.comingSoon);
  }

  create(data: { title?: string; note?: string; tab?: TabId }): void {
    label(this, 20, 22, data.title ?? 'Coming soon', { size: 34, bold: true });
    label(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Coming soon', { size: 28, bold: true }).setOrigin(0.5);
    label(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 4, data.note ?? '', { size: 16, color: COLORS.muted, wrap: 340, align: 'center' }).setOrigin(0.5, 0);
    // Which tab is highlighted: the one that opened this page.
    tabBar(this, data.tab ?? (data.title === 'Promotions' ? 'promos' : 'orders'));
  }
}
