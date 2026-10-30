import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { t } from '../i18n';
import { openLink } from '../promo/config';
import legal from './legal.json';
import { COLORS, RADIUS } from './theme';
import { button, hitArea, label, roundedBox, scrim } from './widgets';

/** The legal text is in English only on purpose, so every language shows the same wording. Edit it in legal.json. */
const TITLE = legal.title;

const BODY_SIZE = 13;
const BODY_MIN_SIZE = 9;
const PARA_STEP = 1.5; // lines from one paragraph's last line to the next one's first

export const LEGAL_LINK = legal.linkLabel;

const CARD = { x: 30, y: 80, w: GAME_WIDTH - 60, h: 640 };

/**
 * Wrapped paragraphs where **double-starred** words are bold and *single-starred* words are italic. A Phaser Text has
 * one style, so each word is its own Text, placed left to right and wrapped by hand. The gap between paragraphs is half a line.
 */
function layoutRich(scene: Phaser.Scene, paragraphs: string[], x: number, y: number, maxW: number, size: number, depth: number): { items: Phaser.GameObjects.Text[]; height: number } {
  const items: Phaser.GameObjects.Text[] = [];
  const word = (text: string, bold: boolean, italic = false): Phaser.GameObjects.Text => {
    const obj = label(scene, 0, 0, text, { size, bold }).setDepth(depth);
    if (italic) obj.setFontStyle('italic');
    return obj;
  };
  const probe = word('a', false);
  const lineH = probe.height;
  const space = size * 0.3;
  probe.destroy();
  let cx = 0;
  let cy = 0;
  paragraphs.forEach((para, i) => {
    if (i > 0) {
      cy += lineH * PARA_STEP;
      cx = 0;
    }
    const chunks = para
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .filter(Boolean)
      .map((raw) => {
        const bold = raw.startsWith('**') && raw.endsWith('**');
        const italic = !bold && raw.startsWith('*') && raw.endsWith('*');
        return { text: bold ? raw.slice(2, -2) : italic ? raw.slice(1, -1) : raw, bold, italic };
      });
    chunks.forEach((chunk, part) => {
      chunk.text.split(/\s+/).filter(Boolean).forEach((w, n) => {
        const obj = word(w, chunk.bold, chunk.italic);
        if (n === 0 && part > 0 && !/^\s/.test(chunk.text) && !/\s$/.test(chunks[part - 1].text) && cx > 0) cx -= space; // no gap where styled and plain text touch, such as a full stop after a bold word
        if (cx > 0 && cx + obj.width > maxW) {
          cx = 0;
          cy += lineH;
        }
        obj.setPosition(x + cx, y + cy);
        items.push(obj);
        cx += obj.width + space;
      });
    });
  });
  return { items, height: cy + lineH };
}

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
  const linkY = CARD.y + CARD.h - 112;
  // The wording lives in legal.json and can grow, so shrink the text until it ends above the links.
  const bodyTop = CARD.y + 76;
  const bodyMaxH = linkY - 24 - bodyTop;
  let size = BODY_SIZE;
  let body = layoutRich(scene, legal.paragraphs, CARD.x + 30, bodyTop, CARD.w - 60, size, depth + 2);
  while (body.height > bodyMaxH && size > BODY_MIN_SIZE) {
    body.items.forEach((o) => o.destroy());
    body = layoutRich(scene, legal.paragraphs, CARD.x + 30, bodyTop, CARD.w - 60, (size -= 0.5), depth + 2);
  }
  body.items.forEach(add);
  const authorLink = add(label(scene, 0, linkY, legal.authorLink.label, { size: 13, bold: true, color: COLORS.accent }).setOrigin(0, 0.5).setDepth(depth + 2));
  const gmmtvLink = add(label(scene, 0, linkY, legal.gmmtvLink.label, { size: 13, bold: true, color: COLORS.accent }).setOrigin(0, 0.5).setDepth(depth + 2));
  const linkGap = 24;
  const linkLeft = (GAME_WIDTH - authorLink.width - linkGap - gmmtvLink.width) / 2;
  authorLink.setX(linkLeft);
  gmmtvLink.setX(linkLeft + authorLink.width + linkGap);
  add(hitArea(scene, authorLink.x - 8, linkY - 18, authorLink.width + 16, 36, () => openLink(legal.authorLink.url)).setDepth(depth + 3));
  add(hitArea(scene, gmmtvLink.x - 8, linkY - 18, gmmtvLink.width + 16, 36, () => openLink(legal.gmmtvLink.url)).setDepth(depth + 3));
  button(scene, GAME_WIDTH / 2, CARD.y + CARD.h - 50, 300, 58, t('settings.close'), close, 'primary', 24, depth + 3).forEach(add);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, close);
}
