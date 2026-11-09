// Constants and pure helpers for the i18n system.
// No React, no side effects: safe to import from tests and non-React code.

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';
export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

export const NAMESPACES = [
  'common',
  'errors',
  'auth',
  'home',
  'assistance',
  'weddings',
  'marketplace',
  'profile',
  'souk',
  'jobs',
  'tools',
  'learn',
  'staff',
  'legal',
] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = 'common';

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

export function isRTL(language: SupportedLanguage): boolean {
  return language === 'ar';
}
