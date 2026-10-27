import { ITEM_RULES } from '../core/constants';
import { difficulty, ramp } from '../core/difficulty';

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
  | { type: 'stun'; durationMs: number }
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
  { id: 'fishSauceBread', label: 'Fish Sauce Bread', kind: 'debuff', weight: 3, effect: { type: 'disorient', durationMs: 4000 }, color: 0xa1887f },
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
  { id: 'planner', label: 'Planner', kind: 'debuff', weight: 2, effect: { type: 'points', amount: -150 }, color: 0x7b1fa2 },
  { id: 'helicopter', label: 'Helicopter', kind: 'buff', weight: 2, effect: { type: 'dash', durationMs: 3000, velocity: -700 }, color: 0x26c6da },
  { id: 'hammer', label: 'Objection Hammer', kind: 'debuff', weight: 6, effect: { type: 'stun', durationMs: 1000 }, color: 0xd32f2f },
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
