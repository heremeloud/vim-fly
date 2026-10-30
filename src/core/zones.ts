import { t, zoneName } from '../i18n';

/**
 * Height zones, taken from the locations of the original novel: ten locations, each its own
 * stage, ZONE_SPACING_METERS apart. Passing a milestone swaps the
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
  | 'aquarium'
  | 'residence'
  | 'bakeLove';

export interface Zone {
  id: ZoneId;
  /** Short name shown on the banner and the receipt. */
  label: string;
  /** 1 to 10: every location is its own stage. */
  stage: number;
  fromMeters: number;
  /** Placeholder palette until real backdrop art exists. */
  base: number;
  accent: number;
}

/** Distance climbed per location. Raise it to spread the story out. */
export const ZONE_SPACING_METERS = 350;

type ZoneDef = Omit<Zone, 'fromMeters' | 'stage'>;

const ZONE_DEFS: readonly ZoneDef[] = [
  { id: 'ruralRoad', label: 'Rural Road', base: 0xf4f1d6, accent: 0xd9c46a },
  { id: 'bakery', label: 'Heartwarming Bakery', base: 0xfaf0e2, accent: 0xe6c79c },
  { id: 'cafes', label: 'Cafe', base: 0xeaf1e8, accent: 0xb4cfb0 },
  { id: 'mall', label: 'Shopping Mall', base: 0xf1eaf3, accent: 0xcdb4d6 },
  { id: 'lawOffice', label: 'CC Law Office', base: 0xeceff1, accent: 0xa3b1ba },
  { id: 'gym', label: 'Gym', base: 0xf6e3da, accent: 0xe3a58f },
  { id: 'courtroom', label: 'The Courtroom', base: 0xe4dcd7, accent: 0xa08a7d },
  { id: 'residence', label: "Noey's Apartment", base: 0xe9eaf3, accent: 0xaab0d4 },
  { id: 'aquarium', label: 'Aquarium', base: 0xe6f2f4, accent: 0x8fcdd6 },
  { id: 'bakeLove', label: 'Bake Love Bakery', base: 0xf8e9ee, accent: 0xe8a9bf },
];

export const ZONES: readonly Zone[] = ZONE_DEFS.map((z, i) => ({ ...z, stage: i + 1, fromMeters: i * ZONE_SPACING_METERS }));

export function zoneAt(heightMeters: number): Zone {
  let current = ZONES[0];
  for (const z of ZONES) if (heightMeters >= z.fromMeters) current = z;
  return current;
}

export function zoneTextureKey(zone: Zone): string {
  return `bg-${zone.id}`;
}

/** The location's name in the current language. */
export function zoneLabel(zone: Zone): string {
  return zoneName(zone.id, zone.label);
}

/** Banner text: the stage on the first line, the location below. Translated. Pass the previous zone to omit the stage line when the stage hasn't changed. */
export function zoneBannerText(zone: Zone, previous?: Zone): string {
  if (previous && previous.stage === zone.stage) return zoneLabel(zone);
  return `${t('zone.stage', { n: zone.stage })}\n${zoneLabel(zone)}`;
}
