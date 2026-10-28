import type { ZoneId } from './zones';

/**
 * Emoji that decorate each location's backdrop. Each zone has seven emoji in two rows: three on the upper half of the tile, four on the lower half (see
 * BootScene.makeBackdrop). Emoji that show a person or body part use the light skin tone.
 */
export const ZONE_ICONS: Record<ZoneId, [string[], string[]]> = {
  ruralRoad: [['🌾', '🐱', '🌳'], ['🌻', '🚙', '🚗', '🐄']],
  bakery: [['🥖', '🍞', '🥐'], ['🥧', '👩🏻‍🍳', '🥯', '🥞']],
  cafes: [['☕', '🍰', '🥪'], ['🧋', '🫖', '🥤', '🍵']],
  mall: [['🍿', '🛍️', '🎬'], ['🧸', '🍦', '🎁', '🛒']],
  lawOffice: [['🖨️', '💼', '📜'], ['🖊️', '📁', '📎', '💻']],
  gym: [['🏋🏻', '💪🏻', '🥤'], ['🤸🏻', '🥗', '👟', '🏃🏻‍♀️']],
  courtroom: [['🧑🏻‍⚖️', '⚖️', '📜'], ['🏛️', '📚', '🖋️', '👮🏻']],
  aquarium: [['🐠', '🐟', '🐡'], ['🐬', '🦈', '🐙', '📔']],
  residence: [['🏢', '🌃', '🛏️'], ['🍷', '🛋️', '🍽️', '📺']],
  bakeLove: [['🍞', '🧈', '🧀'], ['🤎', '🤍', '💛', '🎉']],
};
