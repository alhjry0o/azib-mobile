// Locale + numeral aware formatting bound to the user's preferences.
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate, formatNumber, formatPercent, getLanguage } from '@/i18n';
import { useSettingsStore } from '@/stores';

export interface HomeFormatters {
  number(value: number): string;
  percent(ratio: number): string;
  date(iso: string): string;
}

export function useHomeFormatters(): HomeFormatters {
  useTranslation();
  const numerals = useSettingsStore((s) => s.numberSystem);
  const language = getLanguage();
  return useMemo<HomeFormatters>(
    () => ({
      number: (value: number) => formatNumber(value, { language, numerals }),
      percent: (ratio: number) => formatPercent(ratio, { language, numerals }),
      date: (iso: string) => formatDate(iso, 'medium', { language, numerals }),
    }),
    [language, numerals],
  );
}
