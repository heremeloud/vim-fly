import { t, type StringKey } from '../i18n';

// Everything about the series that the game shows, in one place.
// Fill these in when they are decided; the screens read from here.

export const SHOW = {
  /** The series title (placeholder spelling; confirm). */
  title: 'Bake Love Feeling',
  /** ISO date of the first episode, e.g. '2026-12-01T20:00:00+07:00'. null = not announced. */
  airDate: null as string | null,
  /** Without the leading #, e.g. 'MySeries'. Empty = not decided. */
  hashtag: '',
} as const;

/** Text for the episode countdown strip on the home screen. */
export function countdownText(now: Date = new Date()): string {
  if (!SHOW.airDate) return t('countdown.soon');
  const ms = new Date(SHOW.airDate).getTime() - now.getTime();
  if (Number.isNaN(ms)) return t('countdown.soon');
  if (ms <= 0) return t('countdown.now');
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  return d > 0 ? t('countdown.days', { d, h }) : t('countdown.hours', { h });
}

// ---- Links for the Promos tab (the Bake Love Feeling page), the home screen and the receipt ----

/** The pilot episode. It plays inside the game (see src/ui/videoPlayer.ts); `url` is the YouTube page. */
export const PILOT = {
  videoId: 'NFFWV0X4i_c',
  url: 'https://www.youtube.com/watch?v=NFFWV0X4i_c',
} as const;

export type Platform = 'x' | 'instagram' | 'tiktok';

/** Platform names are brand names, so they are not translated. */
export const PLATFORMS: readonly { id: Platform; name: string }[] = [
  { id: 'x', name: 'X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
];

/**
 * The platforms an account has, with handles without the @ (for example 'bakelovefeeling').
 * Only the platforms listed here get a button. null = not set yet (the button shows "soon").
 */
export type Handles = Partial<Record<Platform, string | null>>;

export interface Account {
  id: string;
  /** Display name. Not translated. */
  name: string;
  /** Optional line under the name, translated. */
  roleKey?: StringKey;
  handles: Handles;
}

const ALL_PLATFORMS_UNSET: Handles = { x: null, instagram: null, tiktok: null };

/** TODO: fill in the handles below. Names marked TBD are placeholders. */
// The official account is on X only.
export const OFFICIAL: Account = { id: 'official', name: SHOW.title, handles: { x: null } };

export const LEADS: readonly Account[] = [
  { id: 'lead1', name: 'Lead actor 1 (name TBD)', roleKey: 'promos.role.cheese', handles: { ...ALL_PLATFORMS_UNSET } },
  { id: 'lead2', name: 'Lead actor 2 (name TBD)', roleKey: 'promos.role.noey', handles: { ...ALL_PLATFORMS_UNSET } },
];

/** Vimmy, the dog in a bee costume: always the playable character. */
export const VIMMY: Account = { id: 'vimmy', name: 'Vimmy', roleKey: 'promos.vimmy.role', handles: { ...ALL_PLATFORMS_UNSET } };

/** The profile page for a handle, or null if the handle is missing or not a plain username. */
export function profileUrl(platform: Platform, handle: string | null | undefined): string | null {
  const h = (handle ?? '').replace(/^@/, '');
  if (!/^[A-Za-z0-9._]{1,40}$/.test(h)) return null;
  switch (platform) {
    case 'x':
      return `https://x.com/${h}`;
    case 'instagram':
      return `https://www.instagram.com/${h}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${h}`;
  }
}

/** Open a link in a new tab. Only https links. */
export function openLink(url: string | null): void {
  if (!url || !url.startsWith('https://')) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
