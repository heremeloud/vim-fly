const KEY = 'vimmy-fly.playerName';
/** Matches the `name` check in supabase/schema.sql. */
export const NAME_MAX = 20;

let memory: string | null = null;

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
  const name = Array.from(raw.trim()).slice(0, NAME_MAX).join('');
  if (!name) return null;
  memory = name;
  try {
    localStorage.setItem(KEY, name);
  } catch {
    // Not saved; still used for this session.
  }
  return name;
}
