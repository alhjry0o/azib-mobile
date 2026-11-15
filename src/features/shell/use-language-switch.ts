// Single entry point for changing the UI language (Onboarding P05.2,
// Developer Settings P05.3). Persists the choice, applies the native
// direction flag (forceRTL) and switches i18next immediately.
import { useCallback } from 'react';
import { setLanguage } from '@/i18n';
import type { SupportedLanguage } from '@/i18n/config';
import { applyDirectionToNativeLayer } from '@/i18n/rtl';
import { useLanguageStore } from '@/stores';

export interface LanguageSwitchApi {
  readonly language: SupportedLanguage;
  switchLanguage(language: SupportedLanguage): Promise<void>;
}

export function useLanguageSwitch(): LanguageSwitchApi {
  const language = useLanguageStore((s) => s.language);

  const switchLanguage = useCallback(async (next: SupportedLanguage): Promise<void> => {
    useLanguageStore.getState().setLanguage(next);
    applyDirectionToNativeLayer(next);
    await setLanguage(next);
  }, []);

  return { language, switchLanguage };
}
