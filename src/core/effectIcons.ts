/**
 * Emoji used by the in-run effects. They are drawn from the bundled Google (Noto) emoji images (see `npm run emoji`),
 * never the device's emoji font, so they look the same everywhere. Body parts use the light skin tone.
 */

/** The picture that pops up above Vimmy's head with each reaction, keyed by item id. */
export const REACTION_ICON: Readonly<Record<string, string>> = {
  goldenRetriever: '💛',
  oyster: '⭐',
  lawyerSuit: '🛡️',
  handkerchief: '💖',
  rollingPin: '⚡',
  helicopter: '❗',
  planner: '💢',
  gavelHammer: '💫',
  cilantroBread: '💦',
  fishSauceBread: '💦',
  carCrash: '💥',
  dogEars: '😳',
};

/** The picture on each status badge under the score. */
export const STATUS_ICON = {
  shield: '🛡️',
  dash: '🚁',
  power: '💪🏻',
  x2: '✨',
  magnet: '🧲',
  stunned: '💫',
  dizzy: '😵',
  slow: '🐌',
  shy: '😳',
} as const;

export const EFFECT_EMOJI: readonly string[] = [...new Set([...Object.values(REACTION_ICON), ...Object.values(STATUS_ICON)])];
