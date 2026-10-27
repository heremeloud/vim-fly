import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { t } from '../i18n';
import { COLORS } from '../ui/theme';
import { label, tabBar, type TabId } from '../ui/widgets';

/** Placeholder for screens that are not built yet (About the show, and the joke services). */
export class ComingSoonScene extends Phaser.Scene {
  constructor() {
    super(SCENES.comingSoon);
  }

  create(data: { title?: string; note?: string; tab?: TabId }): void {
    label(this, 20, 22, data.title ?? t('soon.title'), { size: 34, bold: true });
    label(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, t('soon.title'), { size: 28, bold: true }).setOrigin(0.5);
    label(this, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 4, data.note ?? '', { size: 16, color: COLORS.muted, wrap: 340, align: 'center' }).setOrigin(0.5, 0);
    tabBar(this, data.tab ?? 'store');
  }
}
