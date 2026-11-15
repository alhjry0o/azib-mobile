// Applies the persisted language once the store hydrates:
// - native direction flag (forceRTL) for the persisted choice,
// - i18next language if it differs from the persisted one.
// Renders nothing. Mounted inside the root providers.
import { useEffect } from 'react';
import { getLanguage, setLanguage } from '@/i18n';
import { applyDirectionToNativeLayer } from '@/i18n/rtl';
import { useLanguageStore } from '@/stores';

export function LanguageBootstrap() {
  const hydrated = useLanguageStore((s) => s.hydrated);
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    if (!hydrated) return;
    applyDirectionToNativeLayer(language);
    if (getLanguage() !== language) {
      void setLanguage(language);
    }
  }, [hydrated, language]);

  return null;
}
