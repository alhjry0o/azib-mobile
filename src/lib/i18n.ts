import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

export type Locale = 'ar' | 'en';

const dictionaries = { ar, en } as const;

let currentLocale: Locale = 'ar';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

function resolvePath(root: unknown, keys: readonly string[]): unknown {
  let node: unknown = root;
  for (const key of keys) {
    if (node !== null && typeof node === 'object' && key in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return node;
}

/**
 * Temporary translator. Replaced by a full i18next setup in P03.
 * Returns the key unchanged when the path is missing (never throws, never invents text).
 */
export function t(key: string): string {
  const keys = key.split('.');
  const value = resolvePath(dictionaries[currentLocale], keys);
  if (typeof value === 'string') return value;
  const fallback = resolvePath(dictionaries.en, keys);
  if (typeof fallback === 'string') return fallback;
  return key;
}
