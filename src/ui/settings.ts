import Phaser from 'phaser';
import { GAME_WIDTH } from '../core/constants';
import { updatePlayerName } from '../leaderboard/client';
import { getPlayerName, NAME_MAX, setPlayerName, validatePlayerName } from '../leaderboard/playerName';
import { t } from '../i18n';
import { COLORS, FONT, RADIUS, hex } from './theme';
import { addSoundToggle } from './soundToggle';
import { addHowToPlay } from './howToPlay';
import { LEGAL_LINK, openLegal } from './legal';
import { button, hitArea, label, roundedBox, scrim } from './widgets';

const CARD = { x: 30, y: 80, w: GAME_WIDTH - 60, h: 640 };

/** Settings overlay opened from the home header. For now it only shows how to play; real options come later. */
export function openSettings(scene: Phaser.Scene): void {
  const depth = 100;
  const items: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
    items.push(o);
    return o;
  };
  let input: HTMLInputElement | null = null;
  const place = (): void => {
    if (!input) return;
    const rect = scene.game.canvas.getBoundingClientRect();
    const k = rect.width / GAME_WIDTH;
    Object.assign(input.style, {
      left: `${rect.left + (CARD.x + 30) * k}px`,
      top: `${rect.top + (CARD.y + 110) * k}px`,
      width: `${(CARD.w - 60) * k}px`,
      height: `${50 * k}px`,
      fontSize: `${Math.max(16, 20 * k)}px`, // 16px minimum keeps iOS from zooming in on focus
    });
  };
  /** Save the name if it is valid and changed; returns false (and shows why) if it is not valid. */
  const saveName = (): boolean => {
    if (!input) return true;
    const checked = validatePlayerName(input.value);
    if (checked.problem) {
      nameError.setText(t(checked.problem === 'blocked' ? 'settings.nameBlocked' : 'settings.nameInvalid'));
      input.style.borderColor = hex(COLORS.debuff);
      return false;
    }
    if (checked.name !== getPlayerName()) {
      const saved = setPlayerName(checked.name);
      if (saved) void updatePlayerName(saved);
    }
    return true;
  };
  const close = (): void => {
    if (input) {
      saveName();
      window.removeEventListener('resize', place);
      input.remove();
      input = null;
    }
    items.forEach((o) => o.destroy());
  };

  add(scrim(scene, depth).setInteractive().on('pointerup', close));
  add(roundedBox(scene, CARD.x, CARD.y, CARD.w, CARD.h, COLORS.surface, RADIUS.sheet, COLORS.border).setDepth(depth + 1));
  add(scene.add.rectangle(CARD.x, CARD.y, CARD.w, CARD.h, 0xffffff, 0.001).setOrigin(0).setDepth(depth + 1).setInteractive()); // taps on the card must not close it
  add(label(scene, GAME_WIDTH / 2, CARD.y + 26, t('settings.title'), { size: 26, bold: true, align: 'center' }).setOrigin(0.5, 0).setDepth(depth + 2));

  const x = CARD.x + 30;
  const w = CARD.w - 60;
  add(label(scene, x, CARD.y + 84, t('onboard.nameLabel'), { size: 15, color: COLORS.muted, bold: true }).setDepth(depth + 2));
  const nameError = add(label(scene, x, CARD.y + 162, '', { size: 12, color: COLORS.debuff, wrap: w }).setDepth(depth + 2));
  // The name is edited right here: a real <input> over the canvas (phones get their keyboard), saved on Enter, when
  // it loses focus, or when the card closes. No second dialog and no Save button.
  input = document.createElement('input');
  input.type = 'text';
  input.value = getPlayerName() ?? '';
  input.maxLength = NAME_MAX * 2; // characters beyond NAME_MAX are trimmed on save (emoji count double here)
  input.autocomplete = 'off';
  input.enterKeyHint = 'done';
  input.setAttribute('aria-label', t('onboard.nameLabel'));
  Object.assign(input.style, {
    position: 'fixed',
    boxSizing: 'border-box',
    padding: '0 14px',
    border: `2px solid ${hex(COLORS.border)}`,
    borderRadius: `${RADIUS.control}px`,
    background: hex(COLORS.background),
    color: hex(COLORS.text),
    fontFamily: FONT.family,
    fontWeight: '700',
    outline: 'none',
    zIndex: '10',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(input);
  place();
  window.addEventListener('resize', place);
  input.addEventListener('focus', () => input && (input.style.borderColor = hex(COLORS.primary)));
  input.addEventListener('input', () => {
    nameError.setText('');
    if (input) input.style.borderColor = hex(COLORS.primary);
  });
  input.addEventListener('blur', () => {
    if (saveName() && input) input.style.borderColor = hex(COLORS.border);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (saveName()) input?.blur(); // blur also saves, but only when the page has focus, so save explicitly first
  });

  addSoundToggle(scene, add, x, CARD.y + 176, w, depth);

  add(label(scene, x, CARD.y + 266, t('onboard.howTitle'), { size: 18, bold: true }).setDepth(depth + 2));
  addHowToPlay(scene, add, x, CARD.y + 300, w, depth);

  button(scene, GAME_WIDTH / 2, CARD.y + CARD.h - 68, 300, 58, t('settings.close'), close, 'primary', 24, depth + 3).forEach(add);
  // The footer line: author, version, then the legal link, centred together.
  const footY = CARD.y + CARD.h - 10;
  const foot = { size: 11, color: COLORS.muted };
  const credit = add(label(scene, 0, footY, `created by @heremeloud  ·  v${__APP_VERSION__}  ·  `, foot).setOrigin(0, 1).setDepth(depth + 3));
  const legal = add(label(scene, 0, footY, LEGAL_LINK, foot).setOrigin(0, 1).setDepth(depth + 3));
  const left = GAME_WIDTH / 2 - (credit.width + legal.width) / 2;
  credit.setX(left);
  legal.setX(left + credit.width);
  add(hitArea(scene, legal.x - 10, footY - 28, legal.width + 20, 36, () => {
    if (input) input.style.visibility = 'hidden'; // the name field is a real element over the canvas, so it would show through the page
    openLegal(scene, () => input && (input.style.visibility = 'visible'));
  }).setDepth(depth + 4));
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, close);
}
