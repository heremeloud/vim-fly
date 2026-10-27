// Single source of truth for items. Values are starting points to tune.
// Mirrors the item table in plan.md. Durations are in milliseconds.

/** points = food that adds score, buff = helpful power-up, debuff = harmful. */
export type ItemKind = 'points' | 'buff' | 'debuff';

export type ItemEffect =
  | { type: 'points'; amount: number }
  | { type: 'dash'; durationMs: number; velocity: number } // negative = up, px/s
  | { type: 'shield' }
  | { type: 'doublePoints'; durationMs: number } // item points x2 while active
  | { type: 'disorient'; durationMs: number } // left/right controls reversed
  | { type: 'stun'; durationMs: number }
  | { type: 'slowClimb'; durationMs: number }
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
  { id: 'deliveryCar', label: 'Delivery Car', kind: 'buff', weight: 2, effect: { type: 'dash', durationMs: 2000, velocity: -500 }, color: 0x4caf50 },
  { id: 'helicopter', label: 'Helicopter', kind: 'buff', weight: 2, effect: { type: 'dash', durationMs: 3000, velocity: -700 }, color: 0x26c6da },
  { id: 'briefcase', label: 'Briefcase', kind: 'buff', weight: 3, effect: { type: 'shield' }, color: 0x5c6bc0 },
  { id: 'hammer', label: 'Objection Hammer', kind: 'debuff', weight: 6, effect: { type: 'stun', durationMs: 1000 }, color: 0xd32f2f },
  { id: 'burntBread', label: 'Burnt Bread', kind: 'debuff', weight: 5, effect: { type: 'points', amount: -10 }, color: 0x3e2723 },
  { id: 'carCrash', label: 'Car Crash', kind: 'debuff', weight: 2, effect: { type: 'crash', stunMs: 1800, knockback: 500, points: -50 }, color: 0xff6f00 },
  { id: 'rainCloud', label: 'Rain Cloud', kind: 'debuff', weight: 4, effect: { type: 'slowClimb', durationMs: 3000 }, color: 0x607d8b },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}

/**
 * Weighted random pick. Debuff weights grow with height (up to 3x at 400 m),
 * which is the "debuff ratio rises with height" part of the difficulty curve.
 */
export function pickItem(heightMeters: number, rand: () => number = Math.random): ItemDef {
  const debuffScale = 1 + Math.min(2, heightMeters / 200);
  const weightOf = (i: ItemDef) => (i.kind === 'debuff' ? i.weight * debuffScale : i.weight);
  const total = ITEMS.reduce((sum, i) => sum + weightOf(i), 0);
  let roll = rand() * total;
  for (const item of ITEMS) {
    roll -= weightOf(item);
    if (roll < 0) return item;
  }
  return ITEMS[0];
}
