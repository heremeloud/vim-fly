import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '../core/constants';
import { setSoundEnabled, soundEnabled } from '../audio/sfx';
import { getPlayerName, setPlayerName, NAME_MAX } from '../leaderboard/playerName';
import { t } from '../i18n';
import { COLORS, FONT, hex } from './theme';
import { button, label, roundedBox } from './widgets';

/** Start a run. The first time, ask for a name and explain the controls before the game begins. */
export function startOrder(scene: Phaser.Scene): void {
  if (getPlayerName()) scene.scene.start(SCENES.game);
  else openWelcome(scene);
}

const CARD = { x: 30, y: 120, w: GAME_WIDTH - 60, h: 600 };
const INPUT = { x: CARD.x + 30, y: CARD.y + 108, w: CARD.w - 60, h: 50 };

function openWelcome(scene: Phaser.Scene): void {
  const depth = 100;
  const items: Phaser.GameObjects.GameObject[] = [];
  const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
    items.push(o);
    return o;
  };

  add(scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.55).setOrigin(0).setDepth(depth).setInteractive());
  add(roundedBox(scene, CARD.x, CARD.y, CARD.w, CARD.h, COLORS.surface, 22).setDepth(depth + 1));
  add(label(scene, GAME_WIDTH / 2, CARD.y + 26, t('onboard.title'), { size: 26, bold: true, wrap: CARD.w - 40, align: 'center' }).setOrigin(0.5, 0).setDepth(depth + 2));
  add(label(scene, INPUT.x, CARD.y + 80, t('onboard.nameLabel'), { size: 15, color: COLORS.muted, bold: true }).setDepth(depth + 2));

  add(label(scene, INPUT.x, CARD.y + 184, t('onboard.howTitle'), { size: 18, bold: true }).setDepth(depth + 2));
  const steps = [
    ['👆', t('onboard.tap')],
    ['🍞', t('onboard.catch')],
    ['💨', t('onboard.swipe')],
  ];
  steps.forEach(([icon, text], i) => {
    const y = CARD.y + 226 + i * 76;
    add(roundedBox(scene, INPUT.x, y, INPUT.w, 64, COLORS.background, 14).setDepth(depth + 2));
    add(scene.add.text(INPUT.x + 28, y + 32, icon, { fontFamily: FONT.family, fontSize: '26px' }).setOrigin(0.5).setDepth(depth + 3));
    add(label(scene, INPUT.x + 56, y + 32, text, { size: 14, wrap: INPUT.w - 70 }).setOrigin(0, 0.5).setDepth(depth + 3));
  });

  // Sound starts off; this is the player's first chance to turn it on.
  const soundY = CARD.y + 454;
  add(roundedBox(scene, INPUT.x, soundY, INPUT.w, 50, COLORS.background, 14).setDepth(depth + 2));
  const soundText = add(label(scene, INPUT.x + 16, soundY + 25, '', { size: 18, bold: true }).setOrigin(0, 0.5).setDepth(depth + 3));
  const showSound = (): void => {
    soundText.setText(`${soundEnabled() ? '🔊' : '🔇'}  ${t('settings.sound')}: ${t(soundEnabled() ? 'settings.on' : 'settings.off')}`);
  };
  showSound();
  add(scene.add.rectangle(INPUT.x, soundY, INPUT.w, 50, 0x000000, 0).setOrigin(0).setDepth(depth + 4).setInteractive({ useHandCursor: true })).on('pointerup', () => {
    setSoundEnabled(scene.game, !soundEnabled());
    showSound();
  });

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
    borderRadius: '14px',
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

  const close = (): void => {
    window.removeEventListener('resize', place);
    document.removeEventListener('pointerdown', dismissKeyboard);
    input.remove();
    items.forEach((o) => o.destroy());
  };
  const submit = (): void => {
    if (!setPlayerName(input.value)) {
      input.style.borderColor = hex(COLORS.debuff);
      input.focus();
      return;
    }
    close();
    scene.scene.start(SCENES.game);
  };
  input.addEventListener('input', () => (input.style.borderColor = hex(COLORS.primary)));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
      submit();
    }
    else if (e.key === 'Escape') close();
  });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, close);

  // Buttons draw at depth 0, so lift everything they added above the card.
  const before = scene.children.length;
  button(scene, GAME_WIDTH / 2, CARD.y + CARD.h - 46, 300, 58, t('onboard.start'), submit);
  scene.children.list.slice(before).forEach((o) => {
    (o as Phaser.GameObjects.GameObject & { setDepth: (d: number) => void }).setDepth(depth + 3);
    items.push(o);
  });
  input.focus();
}
