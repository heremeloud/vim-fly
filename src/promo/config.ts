// Everything about the series that the game shows, in one place.
// Fill these in when they are decided; the screens read from here.

export const SHOW = {
  /** Placeholder until the series title is decided. */
  title: 'Vimmy Fly',
  /** ISO date of the first episode, e.g. '2026-12-01T20:00:00+07:00'. null = not announced. */
  airDate: null as string | null,
  /** Without the leading #, e.g. 'MySeries'. Empty = not decided. */
  hashtag: '',
} as const;

/** Text for the episode countdown strip on the home screen. */
export function countdownText(now: Date = new Date()): string {
  if (!SHOW.airDate) return 'Episode 1 · coming soon';
  const ms = new Date(SHOW.airDate).getTime() - now.getTime();
  if (Number.isNaN(ms)) return 'Episode 1 · coming soon';
  if (ms <= 0) return 'Now streaming!';
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `Episode 1 airs in ${days}d ${hours}h` : `Episode 1 airs in ${hours}h`;
}
