import { hasKey, t, type StringKey } from '../i18n';
import raw from './links.json';

// Everything about the series that the game shows. The values live in links.json (edit that file,
// not this one); this file reads it, checks it, and offers it to the screens.

// ---- What links.json contains ----

type Platform = 'x' | 'instagram' | 'tiktok' | 'youtube' | 'website';
type Handles = Partial<Record<Platform, string | null>>;

interface RawAccount {
  name?: string;
  avatar?: string;
  banner?: string;
  roleKey?: string;
  handles?: Handles;
}

interface RawLinks {
  show?: { title?: string; airDate?: string | null; hashtag?: string };
  pilot?: { youtube?: string };
  official?: RawAccount;
  leads?: RawAccount[];
  vimmy?: RawAccount;
}

const links = raw as unknown as RawLinks;

/** Say what is wrong with links.json in the browser console (dev) instead of failing silently. */
function problem(message: string): void {
  if (import.meta.env.DEV) console.warn(`[links.json] ${message}`);
}

// ---- The show ----

export const SHOW = {
  /** The series title. */
  title: links.show?.title?.trim() || 'Bake Love Feeling',
  /** ISO date of the first episode, e.g. '2026-12-01T20:00:00+07:00'. null = not announced. */
  airDate: links.show?.airDate ?? null,
  /** Without the leading #, e.g. 'MySeries'. Empty = not decided. */
  hashtag: links.show?.hashtag ?? '',
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

// ---- The pilot ----

/** The 11-character video id from any common YouTube link (watch, youtu.be, embed, shorts). */
export function youtubeId(url: string | undefined): string | null {
  const m = (url ?? '').match(/(?:[?&]v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const pilotId = youtubeId(links.pilot?.youtube);
if (!pilotId) problem('pilot.youtube is not a YouTube link');

/** The pilot episode. It plays inside the game (see src/ui/videoPlayer.ts); `url` is the YouTube page. */
export const PILOT = {
  videoId: pilotId ?? '',
  url: pilotId ? `https://www.youtube.com/watch?v=${pilotId}` : 'https://www.youtube.com/',
} as const;

// ---- Accounts ----

export type { Platform, Handles };

/** Platform names are brand names, so they are not translated. */
export const PLATFORMS: readonly { id: Platform; name: string }[] = [
  { id: 'x', name: 'X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'website', name: 'Website' },
];

export interface Account {
  id: string;
  /** Display name. Not translated. */
  name: string;
  /** Shown in the avatar circle: an emoji, or the file name of a photo in src/assets/avatars (for example "view.jpg"). */
  avatar: string;
  /** Optional header photo (file name in src/assets/avatars) shown across the top of a wide card. */
  banner?: string;
  /** Optional line under the name, translated. */
  roleKey?: StringKey;
  /**
   * The platforms the account has. A platform listed with a handle gets a button; one listed as null
   * is "coming" (an account with nothing set yet shows one quiet "soon" tag); one not listed is not shown.
   */
  handles: Handles;
}

function toAccount(id: string, a: RawAccount | undefined, fallbackName: string): Account {
  const roleKey = a?.roleKey;
  if (roleKey && !hasKey(roleKey)) problem(`${id}: unknown roleKey "${roleKey}"`);
  const handles: Handles = {};
  for (const p of PLATFORMS) if (a?.handles && p.id in a.handles) handles[p.id] = a.handles[p.id] ?? null;
  for (const key of Object.keys(a?.handles ?? {})) if (!PLATFORMS.some((p) => p.id === key)) problem(`${id}: unknown platform "${key}"`);
  for (const p of PLATFORMS) {
    const value = handles[p.id];
    if (value && !profileUrl(p.id, value)) problem(`${id}: "${value}" is not a valid ${p.name} handle or link`);
  }
  return {
    id,
    name: a?.name?.trim() || fallbackName,
    avatar: a?.avatar || '🙂',
    banner: a?.banner || undefined,
    roleKey: roleKey && hasKey(roleKey) ? roleKey : undefined,
    handles,
  };
}

export const OFFICIAL: Account = toAccount('official', links.official, SHOW.title);

export const LEADS: readonly Account[] = (links.leads ?? []).map((a, i) => toAccount(`lead${i + 1}`, a, `Lead actor ${i + 1}`));

/** Vimmy, the dog in a bee costume: always the playable character. */
export const VIMMY: Account = toAccount('vimmy', links.vimmy, 'Vimmy');

// ---- Turning handles into links ----

const HOSTS: Record<Platform, string[]> = {
  x: ['x.com', 'twitter.com'],
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com'],
  youtube: ['youtube.com', 'm.youtube.com'],
  website: [], // any site: only a full https link is accepted
};

/**
 * The profile page for a handle ("BakeLoveFeeling" or "@BakeLoveFeeling") or for a full https link on that
 * platform's own site. Anything else (empty, odd characters, another website) gives null.
 */
export function profileUrl(platform: Platform, value: string | null | undefined): string | null {
  const v = (value ?? '').trim();
  if (!v) return null;

  if (v.startsWith('https://')) {
    try {
      const url = new URL(v);
      return platform === 'website' || HOSTS[platform].includes(url.hostname.replace(/^www\./, '')) ? url.toString() : null;
    } catch {
      return null;
    }
  }

  if (platform === 'website') return null;
  const h = v.replace(/^@/, '');
  if (!/^[A-Za-z0-9._]{1,40}$/.test(h)) return null;
  switch (platform) {
    case 'x':
      return `https://x.com/${h}`;
    case 'instagram':
      return `https://www.instagram.com/${h}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${h}`;
    case 'youtube':
      return `https://www.youtube.com/@${h}`;
  }
}

/** Copy text to the clipboard. Resolves false when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers or blocked permissions: fall back to a hidden textarea.
    const box = document.createElement('textarea');
    box.value = text;
    box.style.position = 'fixed';
    box.style.opacity = '0';
    document.body.appendChild(box);
    box.select();
    const ok = document.execCommand('copy');
    box.remove();
    return ok;
  }
}

/** Open a link in a new tab. Only https links. */
export function openLink(url: string | null): void {
  if (!url || !url.startsWith('https://')) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}
