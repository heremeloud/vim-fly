// Single source of truth for items. Values are starting points to tune.
// Mirrors the item table in plan.md. Durations are in milliseconds.

export type ItemKind = 'buff' | 'debuff';

export type ItemEffect =
  | { type: 'points'; amount: number }
  | { type: 'dash'; durationMs: number }
  | { type: 'helicopter'; durationMs: number }
  | { type: 'shield' }
  | { type: 'stun'; durationMs: number }
  | { type: 'slowClimb'; durationMs: number };

export interface ItemDef {
  id: string;
  label: string; // shown in the menu-style item guide
  kind: ItemKind;
  /** Relative spawn weight; higher = more common. */
  weight: number;
  effect: ItemEffect;
}

export const ITEMS: readonly ItemDef[] = [
  { id: 'croissant', label: 'Croissant', kind: 'buff', weight: 10, effect: { type: 'points', amount: 10 } },
  { id: 'bread', label: 'Bread', kind: 'buff', weight: 10, effect: { type: 'points', amount: 10 } },
  { id: 'cupcake', label: 'Cupcake', kind: 'buff', weight: 8, effect: { type: 'points', amount: 15 } },
  { id: 'cake', label: 'Cake', kind: 'buff', weight: 2, effect: { type: 'points', amount: 100 } },
  { id: 'deliveryCar', label: 'Delivery Car', kind: 'buff', weight: 2, effect: { type: 'dash', durationMs: 3000 } },
  { id: 'helicopter', label: 'Helicopter', kind: 'buff', weight: 2, effect: { type: 'helicopter', durationMs: 4000 } },
  { id: 'briefcase', label: 'Briefcase', kind: 'buff', weight: 3, effect: { type: 'shield' } },
  { id: 'hammer', label: 'Objection Hammer', kind: 'debuff', weight: 6, effect: { type: 'stun', durationMs: 1000 } },
  { id: 'burntBread', label: 'Burnt Bread', kind: 'debuff', weight: 5, effect: { type: 'points', amount: -10 } },
  { id: 'rainCloud', label: 'Rain Cloud', kind: 'debuff', weight: 4, effect: { type: 'slowClimb', durationMs: 3000 } },
];

export function getItem(id: string): ItemDef | undefined {
  return ITEMS.find((i) => i.id === id);
}
