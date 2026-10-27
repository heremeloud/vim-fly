import { t } from '../i18n';

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
