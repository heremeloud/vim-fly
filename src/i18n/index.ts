import { en, type StringKey } from './en';
import { th } from './th';
import { ja } from './ja';
import { zh } from './zh';

export type Locale = 'en' | 'th' | 'ja' | 'zh';
export type { StringKey };

export interface LocaleInfo {
  id: Locale;
  /** Shown in the language picker, always in the language itself. No flags. */
  name: string;
  /** BCP 47 tag for dates and numbers. Thai uses the Thai (Buddhist-era) calendar by design. */
  dateLocale: string;
}

export const LOCALES: readonly LocaleInfo[] = [
  { id: 'en', name: 'English', dateLocale: 'en-GB' },
  { id: 'th', name: 'ไทย', dateLocale: 'th-TH' },
  { id: 'ja', name: '日本語', dateLocale: 'ja-JP' },
  { id: 'zh', name: '中文', dateLocale: 'zh-CN' },
];

const TABLES: Record<Locale, Record<StringKey, string>> = { en, th, ja, zh };
const STORAGE_KEY = 'vimmy-fly.locale';

function detect(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in TABLES) return saved as Locale;
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
  if (lang.startsWith('th')) return 'th';
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('zh')) return 'zh';
  return 'en';
}

let current: Locale = detect();

export function getLocale(): Locale {
  return current;
}

export function localeInfo(id: Locale = current): LocaleInfo {
  return LOCALES.find((l) => l.id === id) ?? LOCALES[0];
}

export function setLocale(id: Locale): void {
  current = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Not saved; still applies for this session.
  }
}

function fill(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_m, k: string) => (k in params ? String(params[k]) : `{${k}}`));
}

/** Translate a known key, filling {placeholders}. */
export function t(key: StringKey, params?: Record<string, string | number>): string {
  return fill(TABLES[current][key] ?? en[key], params);
}

/** Look up a key built at runtime (item and zone names). Returns the fallback if it has no entry. */
export function tDynamic(key: string, fallback: string, params?: Record<string, string | number>): string {
  const text = (TABLES[current] as Record<string, string>)[key] ?? (en as Record<string, string>)[key];
  return text === undefined ? fallback : fill(text, params);
}

export function itemName(id: string, fallback: string): string {
  return tDynamic(`item.${id}`, fallback);
}

export function zoneName(id: string, fallback: string): string {
  return tDynamic(`zone.${id}`, fallback);
}

