/** Height zones: the backdrop and a banner change as the dog climbs past each milestone. */
export interface Zone {
  id: 'bakeryStreet' | 'rooftops' | 'courthouse' | 'clouds';
  label: string;
  fromMeters: number;
  /** Placeholder palette until real backdrop art exists. */
  base: number;
  accent: number;
}

export const ZONES: readonly Zone[] = [
  { id: 'bakeryStreet', label: 'Bakery Street', fromMeters: 0, base: 0xfff3e0, accent: 0xffe0b2 },
  { id: 'rooftops', label: 'Downtown Rooftops', fromMeters: 250, base: 0xffccbc, accent: 0xbcaaa4 },
  { id: 'courthouse', label: 'The Courthouse', fromMeters: 500, base: 0xeceff1, accent: 0xcfd8dc },
  { id: 'clouds', label: 'Above the Clouds', fromMeters: 800, base: 0xbbdefb, accent: 0xffffff },
];

export function zoneAt(heightMeters: number): Zone {
  let current = ZONES[0];
  for (const z of ZONES) if (heightMeters >= z.fromMeters) current = z;
  return current;
}

export function zoneTextureKey(zone: Zone): string {
  return `bg-${zone.id}`;
}
