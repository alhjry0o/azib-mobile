// i18n entry: creates the i18next instance and exposes translate() + useTranslation.
// All namespaces are bundled (no lazy loading) — appropriate for a mobile app.

import { createInstance } from 'i18next';
import * as Localization from 'expo-localization';
import { initReactI18next } from 'react-i18next';

import arCommon from '@/locales/ar/common.json';
import arErrors from '@/locales/ar/errors.json';
import arAuth from '@/locales/ar/auth.json';
import arHome from '@/locales/ar/home.json';
import arAssistance from '@/locales/ar/assistance.json';
import arWeddings from '@/locales/ar/weddings.json';
import arMarketplace from '@/locales/ar/marketplace.json';
import arProfile from '@/locales/ar/profile.json';
import arSouk from '@/locales/ar/souk.json';
import arJobs from '@/locales/ar/jobs.json';
import arTools from '@/locales/ar/tools.json';
import arLearn from '@/locales/ar/learn.json';
import arStaff from '@/locales/ar/staff.json';
import arLegal from '@/locales/ar/legal.json';

import enCommon from '@/locales/en/common.json';
import enErrors from '@/locales/en/errors.json';
import enAuth from '@/locales/en/auth.json';
import enHome from '@/locales/en/home.json';
import enAssistance from '@/locales/en/assistance.json';
import enWeddings from '@/locales/en/weddings.json';
import enMarketplace from '@/locales/en/marketplace.json';
import enProfile from '@/locales/en/profile.json';
import enSouk from '@/locales/en/souk.json';
import enJobs from '@/locales/en/jobs.json';
import enTools from '@/locales/en/tools.json';
import enLearn from '@/locales/en/learn.json';
import enStaff from '@/locales/en/staff.json';
import enLegal from '@/locales/en/legal.json';

import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  NAMESPACES,
  isSupportedLanguage,
  type SupportedLanguage,
} from './config';

const resources = {
  ar: {
    common: arCommon,
    errors: arErrors,
    auth: arAuth,
    home: arHome,
    assistance: arAssistance,
    weddings: arWeddings,
    marketplace: arMarketplace,
    profile: arProfile,
    souk: arSouk,
    jobs: arJobs,
    tools: arTools,
    learn: arLearn,
    staff: arStaff,
    legal: arLegal,
  },
  en: {
    common: enCommon,
    errors: enErrors,
    auth: enAuth,
    home: enHome,
    assistance: enAssistance,
    weddings: enWeddings,
    marketplace: enMarketplace,
    profile: enProfile,
    souk: enSouk,
    jobs: enJobs,
    tools: enTools,
    learn: enLearn,
    staff: enStaff,
    legal: enLegal,
  },
} as const;

const instance = createInstance();

instance.use(initReactI18next);
void instance.init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  ns: [...NAMESPACES],
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export const i18n = instance;

export function getLanguage(): SupportedLanguage {
  const lng = instance.language ?? DEFAULT_LANGUAGE;
  const base = lng.split('-')[0] ?? DEFAULT_LANGUAGE;
  return isSupportedLanguage(base) ? base : DEFAULT_LANGUAGE;
}

export async function setLanguage(language: SupportedLanguage): Promise<void> {
  if (!isSupportedLanguage(language)) return;
  await instance.changeLanguage(language);
}

/**
 * Non-React translator. For React components use `useTranslation()`.
 * Cross-namespace access: t('errors:network').
 */
export function translate(
  key: string,
  options?: Record<string, unknown> & { ns?: string },
): string {
  return instance.t(key, options);
}

/**
 * Detects the device language. Returns ar as fallback.
 * This helper is intended for P05 Developer Settings — it does NOT change the default
 * startup language (which remains `ar` per spec).
 */
export function detectDeviceLanguage(): SupportedLanguage {
  try {
    const locales = Localization.getLocales();
    const primary = locales[0];
    if (primary && isSupportedLanguage(primary.languageCode)) {
      return primary.languageCode;
    }
  } catch {
    // getLocales may throw on unsupported environments; fall back gracefully.
  }
  return DEFAULT_LANGUAGE;
}

export { useTranslation } from 'react-i18next';
export type { SupportedLanguage } from './config';
export { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, NAMESPACES, DEFAULT_NAMESPACE } from './config';
export { isRTL, isSupportedLanguage } from './config';
export * from './formatters';
export * from './rtl';
