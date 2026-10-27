import { ITEM_RULES } from '../core/constants';
import { difficulty, ramp } from '../core/difficulty';
import { itemName, t } from '../i18n';

// Single source of truth for items. Values are starting points to tune.
// Mirrors the item table in plan.md. Durations are in milliseconds.

/** points = food that adds score, buff = helpful power-up, debuff = harmful. */
export type ItemKind = 'points' | 'buff' | 'debuff';

export type ItemEffect =
  | { type: 'points'; amount: number }
  | { type: 'dash'; durationMs: number; velocity: number } // negative = up, px/s
  | { type: 'shield' } // blocks the next debuff
  | { type: 'cleanse' } // clears stun and disorient
  | { type: 'strongFlap'; durationMs: number; factor: number } // flap strength multiplier
  | { type: 'doublePoints'; durationMs: number } // item points x2 while active
  | { type: 'disorient'; durationMs: number } // left/right controls reversed
  | { type: 'stun'; durationMs: number; points?: number } // optional point penalty on top of the stun
  | { type: 'slow'; durationMs: number; factor: number } // flap and drift speed multiplier below 1
  | { type: 'crash'; stunMs: number; knockback: number; points: number }; // big debuff

export interface ItemDef {
  id: string;
  label: string; // shown in the menu-style item guide
  kind: ItemKind;
  /** Relative spawn weight; higher = more common. */
  weight: number;
  effect: ItemEffect;
  /** Placeholder rectangle color until real art exists. */
  color: number;
}

export const ITEMS: readonly ItemDef[] = [
  { id: 'pandanCustardBread', label: 'Pandan Custard Bread', kind: 'points', weight: 6, effect: { type: 'points', amount: 10 }, color: 0x8bc34a },
  { id: 'cheeseButterBread', label: 'Cheese Butter Bread', kind: 'points', weight: 6, effect: { type: 'points', amount: 10 }, color: 0xffca28 },
  { id: 'cilantroBread', label: 'Cilantro Bread', kind: 'debuff', weight: 4, effect: { type: 'disorient', durationMs: 3000 }, color: 0x66bb6a },
  { id: 'shiopan', label: 'Shiopan', kind: 'points', weight: 5, effect: { type: 'points', amount: 10 }, color: 0xd7a86e },
  { id: 'fishSauceBread', label: 'Fish Sauce Bread', kind: 'debuff', weight: 3, effect: { type: 'slow', durationMs: 5000, factor: 0.6 }, color: 0xa1887f },
  { id: 'oyster', label: 'Oyster', kind: 'buff', weight: 3, effect: { type: 'doublePoints', durationMs: 5000 }, color: 0xb0bec5 },
  { id: 'sandwich', label: 'Sandwich', kind: 'points', weight: 6, effect: { type: 'points', amount: 10 }, color: 0xffe0b2 },
  { id: 'pasta', label: 'Pasta', kind: 'points', weight: 4, effect: { type: 'points', amount: 20 }, color: 0xef5350 },
  { id: 'coffee', label: 'Coffee', kind: 'points', weight: 4, effect: { type: 'points', amount: 20 }, color: 0x6d4c41 },
  { id: 'wine', label: 'Wine', kind: 'points', weight: 2, effect: { type: 'points', amount: 30 }, color: 0x8e24aa },
  { id: 'shrimpFriedRiceBox', label: 'Shrimp Fried Rice Lunch Box', kind: 'points', weight: 2, effect: { type: 'points', amount: 100 }, color: 0xff8a65 },
  { id: 'goldenRetriever', label: 'Golden Retriever', kind: 'points', weight: 1, effect: { type: 'points', amount: 150 }, color: 0xffc107 },
  { id: 'lawyerSuit', label: 'Lawyer Suit', kind: 'buff', weight: 3, effect: { type: 'shield' }, color: 0x37474f },
  { id: 'handkerchief', label: 'Handkerchief', kind: 'buff', weight: 3, effect: { type: 'cleanse' }, color: 0xe3f2fd },
  { id: 'rollingPin', label: 'Rolling Pin', kind: 'buff', weight: 3, effect: { type: 'strongFlap', durationMs: 5000, factor: 1.5 }, color: 0xd7ccc8 },
  { id: 'planner', label: 'Planner', kind: 'debuff', weight: 2, effect: { type: 'stun', durationMs: 1500, points: -150 }, color: 0x7b1fa2 },
  { id: 'helicopter', label: 'Helicopter', kind: 'buff', weight: 2, effect: { type: 'dash', durationMs: 3000, velocity: -700 }, color: 0x26c6da },
  { id: 'gavelHammer', label: 'Gavel Hammer', kind: 'debuff', weight: 6, effect: { type: 'stun', durationMs: 1000 }, color: 0xd32f2f },
  { id: 'carCrash', label: 'Car Crash', kind: 'debuff', weight: 2, effect: { type: 'crash', stunMs: 1800, knockback: 500, points: -50 }, color: 0xff6f00 },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}

/**
 * Weighted random pick. As difficulty rises, debuffs become more common and
 * points items and buffs rarer (see ITEM_RULES in core/constants.ts).
 */
export function pickItem(heightMeters: number, rand: () => number = Math.random): ItemDef {
  const d = difficulty(heightMeters);
  const scale = {
    points: ramp(ITEM_RULES.pointsWeightScale, d),
    buff: ramp(ITEM_RULES.buffWeightScale, d),
    debuff: ramp(ITEM_RULES.debuffWeightScale, d),
  };
  const weightOf = (i: ItemDef) => i.weight * scale[i.kind];
  const total = ITEMS.reduce((sum, i) => sum + weightOf(i), 0);
  let roll = rand() * total;
  for (const item of ITEMS) {
    roll -= weightOf(item);
    if (roll < 0) return item;
  }
  return ITEMS[0];
}

/** Description of what an item does, built from its effect so it never drifts from the game. Translated. */
export function describeEffect(item: ItemDef): string {
  const e = item.effect;
  const secs = (ms: number) => ms / 1000;
  switch (e.type) {
    case 'points':
      return e.amount >= 0 ? t('effect.points.gain', { n: e.amount }) : t('effect.points.loss', { n: -e.amount });
    case 'dash':
      return t('effect.dash', { s: secs(e.durationMs) });
    case 'shield':
      return t('effect.shield');
    case 'cleanse':
      return t('effect.cleanse');
    case 'strongFlap':
      return t('effect.strongFlap', { p: Math.round((e.factor - 1) * 100), s: secs(e.durationMs) });
    case 'doublePoints':
      return t('effect.doublePoints', { s: secs(e.durationMs) });
    case 'stun':
      return e.points
        ? t('effect.stunPenalty', { s: secs(e.durationMs), n: -e.points })
        : t('effect.stun', { s: secs(e.durationMs) });
    case 'slow':
      return t('effect.slow', { p: Math.round((1 - e.factor) * 100), s: secs(e.durationMs) });
    case 'disorient':
      return t('effect.disorient', { s: secs(e.durationMs) });
    case 'crash':
      return t('effect.crash', { s: secs(e.stunMs), n: -e.points });
  }
}

/** The menu "price": the point value for points items and penalties, otherwise the kind of item. */
export function priceLabel(item: ItemDef): string {
  const e = item.effect;
  if (e.type === 'points') return e.amount >= 0 ? `฿${e.amount}` : `-฿${-e.amount}`;
  return item.kind === 'buff' ? t('price.buff') : t('price.debuff');
}

/** The item's name in the current language. */
export function displayName(item: ItemDef): string {
  return itemName(item.id, item.label);
}
