// Locale-aware formatters. Uses Intl directly (available on Node 26, browsers, Hermes RN 0.88).
// Fallbacks only trigger if Intl or a locale is unavailable; warnings are logged, not thrown.

import { logger } from '@/core/logger';

import type { SupportedLanguage } from './config';

export type NumeralSystem = 'latn' | 'arab';
export type DateStyle = 'short' | 'medium' | 'long';

export interface FormatOptions {
  readonly language?: SupportedLanguage;
  readonly numerals?: NumeralSystem;
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';
const DEFAULT_NUMERALS_AR: NumeralSystem = 'arab';
const DEFAULT_NUMERALS_EN: NumeralSystem = 'latn';
const CURRENCY_CODE = 'YER';

function resolve(language: SupportedLanguage | undefined, numerals: NumeralSystem | undefined): {
  language: SupportedLanguage;
  numerals: NumeralSystem;
} {
  const lang = language ?? DEFAULT_LANGUAGE;
  const nums = numerals ?? (lang === 'ar' ? DEFAULT_NUMERALS_AR : DEFAULT_NUMERALS_EN);
  return { language: lang, numerals: nums };
}

export function isIntlAvailable(): boolean {
  return (
    typeof Intl !== 'undefined' &&
    typeof Intl.NumberFormat === 'function' &&
    typeof Intl.DateTimeFormat === 'function'
  );
}

export function formatNumber(value: number, opts: FormatOptions = {}): string {
  const { language, numerals } = resolve(opts.language, opts.numerals);
  if (!isIntlAvailable()) return String(value);
  try {
    return new Intl.NumberFormat(language, { numberingSystem: numerals }).format(value);
  } catch (e) {
    logger.warn('formatNumber failed', { error: e });
    return String(value);
  }
}

export function formatCurrency(amount: number, opts: FormatOptions = {}): string {
  const { language, numerals } = resolve(opts.language, opts.numerals);
  if (!isIntlAvailable()) {
    const suffix = language === 'ar' ? 'ر.ي' : 'YER';
    return `${String(amount)} ${suffix}`;
  }
  try {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: CURRENCY_CODE,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      numberingSystem: numerals,
    }).format(amount);
  } catch (e) {
    logger.warn('formatCurrency failed', { error: e });
    const suffix = language === 'ar' ? 'ر.ي' : 'YER';
    return `${String(amount)} ${suffix}`;
  }
}

export function formatDate(
  input: Date | string | number,
  style: DateStyle = 'medium',
  opts: FormatOptions = {},
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    logger.warn('formatDate received invalid date', { input: String(input) });
    return '';
  }
  const { language, numerals } = resolve(opts.language, opts.numerals);
  if (!isIntlAvailable()) {
    return date.toISOString().slice(0, 10);
  }
  try {
    return new Intl.DateTimeFormat(language, {
      dateStyle: style,
      numberingSystem: numerals,
    }).format(date);
  } catch (e) {
    logger.warn('formatDate failed', { error: e });
    return date.toISOString().slice(0, 10);
  }
}

export function formatPercent(ratio: number, opts: FormatOptions = {}): string {
  const { language, numerals } = resolve(opts.language, opts.numerals);
  if (!isIntlAvailable()) return `${String(Math.round(ratio * 100))}%`;
  try {
    return new Intl.NumberFormat(language, {
      style: 'percent',
      maximumFractionDigits: 1,
      numberingSystem: numerals,
    }).format(ratio);
  } catch (e) {
    logger.warn('formatPercent failed', { error: e });
    return `${String(Math.round(ratio * 100))}%`;
  }
}
