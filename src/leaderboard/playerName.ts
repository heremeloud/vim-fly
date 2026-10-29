const KEY = 'vimmy-fly.playerName';
const ID_KEY = 'vimmy-fly.playerId';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Matches the `name` check in supabase/schema.sql. */
export const NAME_MAX = 20;

let memory: string | null = null;
let memoryId: string | null = null;

const BLOCKED_NAME = /(?:\b(?:admin(?:istrator)?|moderator|official|staff|support|system|supabase)\b|fuck|shit|bitch|cunt|nigg|fagg|whore|porn|https?:|\.com\b|\.net\b|\.gg\b)/iu;

export type NameProblem = 'empty' | 'blocked';

/** Client-side convenience; the server repeats this check and remains authoritative. */
export function validatePlayerName(raw: string): { name: string; problem: null } | { name: ''; problem: NameProblem } {
  const name = Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, '').trim()).slice(0, NAME_MAX).join('');
  if (!name) return { name: '', problem: 'empty' };
  if (BLOCKED_NAME.test(name)) return { name: '', problem: 'blocked' };
  return { name, problem: null };
}

function newPlayerId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Stable, opaque leaderboard identity for this browser. It is never shown to the player. */
export function getPlayerId(): string {
  try {
    const saved = localStorage.getItem(ID_KEY);
    if (saved && UUID.test(saved)) return saved;
    const id = newPlayerId();
    localStorage.setItem(ID_KEY, id);
    return id;
  } catch {
    memoryId ??= newPlayerId();
    return memoryId;
  }
}

/** The name this player entered on their first order, or null if they haven't yet. */
export function getPlayerName(): string | null {
  try {
    return localStorage.getItem(KEY) || memory;
  } catch {
    return memory; // Storage blocked: remembered for this session only.
  }
}

/** Saves a trimmed name (1 to NAME_MAX characters). Returns the saved name, or null if it was empty. */
export function setPlayerName(raw: string): string | null {
  const result = validatePlayerName(raw);
  if (result.problem) return null;
  const name = result.name;
  memory = name;
  getPlayerId();
  try {
    localStorage.setItem(KEY, name);
  } catch {
    // Not saved; still used for this session.
  }
  return name;
}
