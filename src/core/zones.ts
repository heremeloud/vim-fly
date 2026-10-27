/**
 * Height zones, taken from the locations of the original novel: five story tiers,
 * two locations per tier, ZONE_SPACING_METERS apart. Passing a milestone swaps the
 * backdrop and shows a banner. Full descriptions are in src/core/ZONES.md.
 */
export type ZoneId =
  | 'ruralRoad'
  | 'bakery'
  | 'cafes'
  | 'mall'
  | 'lawOffice'
  | 'gym'
  | 'courtroom'
  | 'beach'
  | 'residence'
  | 'bakeLove';

export interface Zone {
  id: ZoneId;
  /** Short name shown on the banner and the receipt. */
  label: string;
  tier: 1 | 2 | 3 | 4 | 5;
  fromMeters: number;
  /** Placeholder palette until real backdrop art exists. */
  base: number;
  accent: number;
}

/** Distance climbed per location. Raise it to spread the story out. */
export const ZONE_SPACING_METERS = 200;

export const TIER_NAMES: Record<Zone['tier'], string> = {
  1: 'Humble Beginnings',
  2: 'Branching Out',
  3: 'Getting Serious',
  4: 'The Big Moments',
  5: 'True Independence',
};

type ZoneDef = Omit<Zone, 'fromMeters'>;

const ZONE_DEFS: readonly ZoneDef[] = [
  { id: 'ruralRoad', label: 'Rural Road', tier: 1, base: 0xfff59d, accent: 0xf9a825 },
  { id: 'bakery', label: 'Heartwarming Bakery', tier: 1, base: 0xfff3e0, accent: 0xffcc80 },
  { id: 'cafes', label: 'Suburban Cafés', tier: 2, base: 0xe8f5e9, accent: 0xa5d6a7 },
  { id: 'mall', label: 'Shopping Mall', tier: 2, base: 0xf3e5f5, accent: 0xce93d8 },
  { id: 'lawOffice', label: 'CC Law Office', tier: 3, base: 0xeceff1, accent: 0x90a4ae },
  { id: 'gym', label: 'Fitness Second Gym', tier: 3, base: 0xffccbc, accent: 0xff8a65 },
  { id: 'courtroom', label: 'The Courtroom', tier: 4, base: 0xd7ccc8, accent: 0x8d6e63 },
  { id: 'beach', label: 'Sweet Sea Beach', tier: 4, base: 0xe0f7fa, accent: 0x4dd0e1 },
  { id: 'residence', label: "Noey's Residence", tier: 5, base: 0xe8eaf6, accent: 0x9fa8da },
  { id: 'bakeLove', label: 'Bake Love Bakery', tier: 5, base: 0xfce4ec, accent: 0xf48fb1 },
];

export const ZONES: readonly Zone[] = ZONE_DEFS.map((z, i) => ({ ...z, fromMeters: i * ZONE_SPACING_METERS }));

export function zoneAt(heightMeters: number): Zone {
  let current = ZONES[0];
  for (const z of ZONES) if (heightMeters >= z.fromMeters) current = z;
  return current;
}

export function zoneTextureKey(zone: Zone): string {
  return `bg-${zone.id}`;
}

/** Banner text: the tier on the first line, the location below. */
export function zoneBannerText(zone: Zone): string {
  return `Tier ${zone.tier} · ${TIER_NAMES[zone.tier]}\n${zone.label}`;
}
