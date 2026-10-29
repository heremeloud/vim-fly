export const NAME_MAX = 20;

const BLOCKED_NAME = /(?:\b(?:admin(?:istrator)?|moderator|official|staff|support|system|supabase)\b|fuck|shit|bitch|cunt|nigg|fagg|whore|porn|https?:|\.com\b|\.net\b|\.gg\b)/iu;

/** Normalize and moderate public leaderboard names. Empty means rejected. */
export function cleanPlayerName(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  // deno-lint-ignore no-control-regex
  const name = Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, '').trim()).slice(0, NAME_MAX).join('');
  return name && !BLOCKED_NAME.test(name) ? name : '';
}
