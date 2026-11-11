import type { SeedSettingsEntry } from './types';

export const seedSettings: readonly SeedSettingsEntry[] = [
  { key: 'theme', value: { mode: 'dark' } },
  { key: 'locale', value: { language: 'ar', numerals: 'arab' } },
  { key: 'demo', value: { banner: true } },
];
