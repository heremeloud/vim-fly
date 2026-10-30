import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { t } from '../i18n';
import { openLink } from '../promo/config';
import { COLORS, RADIUS } from './theme';
import { button, hitArea, label, roundedBox, scrim } from './widgets';

/** The legal text is in English only on purpose, so every language shows the same wording. */
const TITLE = 'Legal & Disclaimer';
const BODY =
  'Vimmy Fly is a free, unofficial, non-commercial fan game. It is not affiliated with, authorized, endorsed or sponsored by GMMTV, Snow Leopard, the cast or other rights holders.\n\n' +
  'The game drawings, sprites and item art are original fan art. Vimmy and the series characters belong to GMMTV. Item concepts and story references are inspired by the Bake Love Feeling pilot and the novel ขนมปังชีสเนย (Bake Love Feelings) by Snow Leopard (เสือดาวหิมะ).\n\n' +
  'Profile photos, banners and other third-party images belong to GMMTV and/or their respective creators. No ownership or license is claimed over third-party characters, stories, likenesses, images, logos or trademarks.\n\n' +
  'All shops, prices and orders are fictional. Nothing is offered for sale.\n\n' +
  'Leaderboard: your display name, scores and a random browser ID are submitted; top names and scores are public. Do not use personal or sensitive information.\n\n' +
  'This free fan game is provided without guarantees that it will always work correctly or be available.';

export const LEGAL_LINK = 'legal & disclaimer';

const CARD = { x: 30, y: 80, w: GAME_WIDTH - 60, h: 640 };
const AUTHOR_URL = 'https://www.mebmarket.com/p/snowleopard';
const GMMTV_URL = 'https://www.gmm-tv.com/';

/** The legal and disclaimer page, opened from settings. It sits on top of settings and closes back to it. */
export function openLegal(scene: Phaser.Scene, onClose: () => void = () => {}): void {
  const depth = 140;
  const items: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
    items.push(o);
    return o;
  };
  const close = (): void => {
    if (!items.some((o) => o.active)) return;
    items.forEach((o) => o.destroy());
    onClose();
  };

  add(scrim(scene, depth).setInteractive().on('pointerup', close));
  add(roundedBox(scene, CARD.x, CARD.y, CARD.w, CARD.h, COLORS.surface, RADIUS.sheet, COLORS.border).setDepth(depth + 1));
  add(scene.add.rectangle(CARD.x, CARD.y, CARD.w, CARD.h, 0xffffff, 0.001).setOrigin(0).setDepth(depth + 1).setInteractive()); // taps on the card must not close it
  add(label(scene, GAME_WIDTH / 2, CARD.y + 26, TITLE, { size: 26, bold: true, align: 'center' }).setOrigin(0.5, 0).setDepth(depth + 2));
  add(label(scene, CARD.x + 30, CARD.y + 76, BODY, { size: 13, wrap: CARD.w - 60 }).setDepth(depth + 2));
  const linkY = CARD.y + CARD.h - 112;
  const authorLink = add(label(scene, 0, linkY, 'Snow Leopard’s books ↗', { size: 13, bold: true, color: COLORS.accent }).setOrigin(0, 0.5).setDepth(depth + 2));
  const gmmtvLink = add(label(scene, 0, linkY, 'GMMTV official site ↗', { size: 13, bold: true, color: COLORS.accent }).setOrigin(0, 0.5).setDepth(depth + 2));
  const linkGap = 24;
  const linkLeft = (GAME_WIDTH - authorLink.width - linkGap - gmmtvLink.width) / 2;
  authorLink.setX(linkLeft);
  gmmtvLink.setX(linkLeft + authorLink.width + linkGap);
  add(hitArea(scene, authorLink.x - 8, linkY - 18, authorLink.width + 16, 36, () => openLink(AUTHOR_URL)).setDepth(depth + 3));
  add(hitArea(scene, gmmtvLink.x - 8, linkY - 18, gmmtvLink.width + 16, 36, () => openLink(GMMTV_URL)).setDepth(depth + 3));
  button(scene, GAME_WIDTH / 2, CARD.y + CARD.h - 50, 300, 58, t('settings.close'), close, 'primary', 24, depth + 3).forEach(add);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, close);
}
