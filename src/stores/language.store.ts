// Persisted UI language (client state only, ADR-0002).
// Mirrors the onboarding.store hydration pattern. The persisted choice is
// applied at boot by LanguageBootstrap (i18n + native direction), so the
// "restart to complete direction flip" promise stays honest.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '@/i18n/config';

export interface LanguageState {
  language: SupportedLanguage;
  hydrated: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  /** Internal: used by persist middleware only. */
  _setHydrated: (hydrated: boolean) => void;
}

export const LANGUAGE_STORAGE_KEY = 'azib.language.v1';

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      hydrated: false,
      setLanguage: (language) => set({ language }),
      _setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: LANGUAGE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
