import { ZONES, zoneAt, type ZoneId } from './zones';

/**
 * Every location except the last ends with a short themed stretch: its final FINALE_METERS. The banner
 * announces it, the items that fit the place fall more often, and a small effect can nudge Vimmy.
 * Nothing here is big: it's flavour, not a new difficulty level. Multipliers are sized to how rare each
 * item normally is, so a themed item makes up roughly 15-35% of what falls, enough to notice in 100 m.
 */
export const FINALE_METERS = 100;

export interface Finale {
  /** Spawn weight multipliers by item id (1 when not listed). An item listed above 1 can fall even before its `minStage`. */
  items: Readonly<Record<string, number>>;
  /** Items that must fall during the finale (not left to chance): `count` of them, spread evenly across its length. */
  guaranteed?: { id: string; count: number };
  /** Peak sideways push in px/s. It sways left and right so it never just pins Vimmy to one wall. */
  wind?: number;
  /** Multiplies how hard each flap lifts (above 1 helps, below 1 hinders). */
  flapScale?: number;
}

const FINALES: Partial<Record<ZoneId, Finale>> = {
  ruralRoad: { items: {}, guaranteed: { id: 'carCrash', count: 2 } }, // car crash hour: two cars, for sure
  bakery: { items: { pandanCustardBread: 3, shiopan: 3, cheeseButterBread: 3, cilantroBread: 2, fishSauceBread: 2 } }, // fresh from the oven: every kind of bread, the bad ones too
  cafes: { items: { coffee: 8, sandwich: 2, goldenRetriever: 12 }, flapScale: 1.08 }, // caffeine, and the golden retriever visits
  mall: { items: {} }, // shopping spree: just the banner
  lawOffice: { items: { planner: 3 }, flapScale: 0.95 }, // paperwork
  gym: { items: { rollingPin: 8 }, flapScale: 1.08 }, // pump it up
  courtroom: { items: { gavelHammer: 2 } }, // order in the court
  residence: { items: { wine: 6, pasta: 4, handkerchief: 4 } }, // cozy night in
  aquarium: { items: { fishSauceBread: 3 }, wind: 60 }, // strong current
};

/** The finale the climber is in at this height, with the location it belongs to, or null. */
export function finaleAt(heightMeters: number): (Finale & { zoneId: ZoneId; fromMeters: number }) | null {
  const zone = zoneAt(heightMeters);
  const next = ZONES[ZONES.indexOf(zone) + 1];
  const finale = FINALES[zone.id];
  const fromMeters = next ? next.fromMeters - FINALE_METERS : Infinity;
  if (!next || !finale || heightMeters < fromMeters) return null;
  return { ...finale, zoneId: zone.id, fromMeters };
}
