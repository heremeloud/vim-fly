import Phaser from 'phaser';
import { GAME_WIDTH, SCENES } from '../core/constants';
import { toLayout } from '../core/render';
import { getPlayerName, setPlayerName, validatePlayerName, NAME_MAX } from '../leaderboard/playerName';
import { t } from '../i18n';
import { COLORS, FONT, RADIUS, hex } from './theme';
import { addSoundToggle } from './soundToggle';
import { addHowToPlay } from './howToPlay';
import { button, label, roundedBox, scrim } from './widgets';

/** Start a run. The first time, ask for a name and explain the controls before the game begins. */
export function startOrder(scene: Phaser.Scene): void {
  if (getPlayerName()) scene.scene.start(SCENES.game);
  else openWelcome(scene);
}

const CARD = { x: 30, y: 110, w: GAME_WIDTH - 60, h: 630 };
const INPUT = { x: CARD.x + 30, y: CARD.y + 108, w: CARD.w - 60, h: 50 };

function openWelcome(scene: Phaser.Scene): void {
  const depth = 100;
  const items: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
    items.push(o);
    return o;
  };

  add(scrim(scene, depth));
  // Only the card swallows taps; anywhere else falls through to the page underneath (language, tabs, ...).
  add(scene.add.zone(CARD.x, CARD.y, CARD.w, CARD.h).setOrigin(0).setDepth(depth + 1).setInteractive());
  add(roundedBox(scene, CARD.x, CARD.y, CARD.w, CARD.h, COLORS.surface, RADIUS.sheet, COLORS.border).setDepth(depth + 1));
  add(label(scene, GAME_WIDTH / 2, CARD.y + 26, t('onboard.title'), { size: 26, bold: true, wrap: CARD.w - 40, align: 'center' }).setOrigin(0.5, 0).setDepth(depth + 2));
  add(label(scene, INPUT.x, CARD.y + 80, t('onboard.nameLabel'), { size: 15, color: COLORS.muted, bold: true }).setDepth(depth + 2));
  const nameError = add(label(scene, INPUT.x, CARD.y + 158, '', { size: 12, color: COLORS.debuff, wrap: INPUT.w }).setDepth(depth + 2));

  // Sound sits right under the name, in the same spot as on the settings card. It starts off, so this is the
  // player's first chance to turn it on.
  addSoundToggle(scene, add, INPUT.x, CARD.y + 176, INPUT.w, depth);

  add(label(scene, INPUT.x, CARD.y + 266, t('onboard.howTitle'), { size: 18, bold: true }).setDepth(depth + 2));
  addHowToPlay(scene, add, INPUT.x, CARD.y + 300, INPUT.w, depth);

  // The name field is a real <input> laid over the canvas, so phones show their keyboard and IME.
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = NAME_MAX * 2; // characters beyond NAME_MAX are trimmed on save (emoji count double here)
  input.placeholder = t('onboard.namePlaceholder');
  input.autocomplete = 'off';
  input.enterKeyHint = 'go';
  input.setAttribute('aria-label', t('onboard.nameLabel'));
  Object.assign(input.style, {
    position: 'fixed',
    boxSizing: 'border-box',
    padding: '0 14px',
    border: `2px solid ${hex(COLORS.primary)}`,
    borderRadius: `${RADIUS.control}px`,
    background: '#fff',
    color: hex(COLORS.text),
    fontFamily: FONT.family,
    outline: 'none',
    zIndex: '10',
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(input);

  const place = (): void => {
    const rect = scene.game.canvas.getBoundingClientRect();
    const k = rect.width / GAME_WIDTH;
    Object.assign(input.style, {
      left: `${rect.left + INPUT.x * k}px`,
      top: `${rect.top + INPUT.y * k}px`,
      width: `${INPUT.w * k}px`,
      height: `${INPUT.h * k}px`,
      fontSize: `${Math.max(16, 20 * k)}px`, // 16px minimum keeps iOS from zooming in on focus
    });
  };
  place();
  window.addEventListener('resize', place);

  // Phones keep the keyboard up until the field loses focus, and the canvas doesn't take focus on tap.
  const dismissKeyboard = (e: Event): void => {
    if (e.target !== input) input.blur();
  };
  document.addEventListener('pointerdown', dismissKeyboard);

  const outside = (p: Phaser.Input.Pointer): void => {
    const x = toLayout(p.x);
    const y = toLayout(p.y);
    if (x < CARD.x || x > CARD.x + CARD.w || y < CARD.y || y > CARD.y + CARD.h) close();
  };
  const close = (): void => {
    scene.input?.off('pointerdown', outside);
    window.removeEventListener('resize', place);
    document.removeEventListener('pointerdown', dismissKeyboard);
    input.remove();
    items.forEach((o) => o.destroy());
  };
  const submit = (): void => {
    const checked = validatePlayerName(input.value);
    if (checked.problem || !setPlayerName(checked.name)) {
      input.style.borderColor = hex(COLORS.debuff);
      nameError.setText(t(checked.problem === 'blocked' ? 'settings.nameBlocked' : 'settings.nameInvalid'));
      input.focus();
      return;
    }
    close();
    scene.scene.start(SCENES.game);
  };
  input.addEventListener('input', () => {
    input.style.borderColor = hex(COLORS.primary);
    nameError.setText('');
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
      submit();
    }
    else if (e.key === 'Escape') close();
  });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, close);
  // A tap outside the card dismisses it; the tap still reaches whatever is underneath.
  scene.input.on('pointerdown', outside);

  button(scene, GAME_WIDTH / 2, CARD.y + CARD.h - 46, 300, 58, t('onboard.start'), submit, 'primary', 24, depth + 3).forEach(add);
  input.focus();
}
