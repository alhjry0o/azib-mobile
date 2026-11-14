// Onboarding completion flag (client state only, ADR-0002).
// Persisted in AsyncStorage. Mirrors the app-mode.store hydration pattern.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface OnboardingState {
  completed: boolean;
  hydrated: boolean;
  complete: () => void;
  reset: () => void;
  /** Internal: used by persist middleware only. */
  _setHydrated: (hydrated: boolean) => void;
}

export const ONBOARDING_STORAGE_KEY = 'azib.onboarding.v1';

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      hydrated: false,
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false }),
      _setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: ONBOARDING_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ completed: state.completed }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
