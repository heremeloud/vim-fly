// Single source of truth for items. Values are starting points to tune.
// Mirrors the item table in plan.md. Durations are in milliseconds.

export type ItemKind = 'buff' | 'debuff';

export type ItemEffect =
  | { type: 'points'; amount: number }
  | { type: 'dash'; durationMs: number; velocity: number } // negative = up, px/s
  | { type: 'shield' }
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
  { id: 'croissant', label: 'Croissant', kind: 'buff', weight: 10, effect: { type: 'points', amount: 10 }, color: 0xe6a23c },
  { id: 'bread', label: 'Bread', kind: 'buff', weight: 10, effect: { type: 'points', amount: 10 }, color: 0xc8955a },
  { id: 'cupcake', label: 'Cupcake', kind: 'buff', weight: 8, effect: { type: 'points', amount: 15 }, color: 0xf48fb1 },
  { id: 'cake', label: 'Cake', kind: 'buff', weight: 2, effect: { type: 'points', amount: 100 }, color: 0xffd54f },
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
