// Client-only auth state (ADR-0002). NO tokens, NO passwords, NO session data.
// The guest flag is persisted (local-only, no PII). The challenge and the
// post-auth redirect target stay in memory for this run.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AuthChannel } from '@/providers/contracts/auth';

export interface AuthChallengeState {
  readonly id: string;
  readonly channel: AuthChannel;
  readonly target: string;
  readonly expiresAt: string;
  readonly demoCode: string | null;
}

export interface AuthState {
  guestActive: boolean;
  hydrated: boolean;
  challenge: AuthChallengeState | null;
  redirectAfterAuth: string | null;
  startGuest: () => void;
  endGuest: () => void;
  setChallenge: (challenge: AuthChallengeState | null) => void;
  setRedirectAfterAuth: (path: string | null) => void;
  /** Internal: used by persist middleware only. */
  _setHydrated: (hydrated: boolean) => void;
}

export const AUTH_STORAGE_KEY = 'azib.auth.v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      guestActive: false,
      hydrated: false,
      challenge: null,
      redirectAfterAuth: null,
      startGuest: () => set({ guestActive: true }),
      endGuest: () => set({ guestActive: false }),
      setChallenge: (challenge) => set({ challenge }),
      setRedirectAfterAuth: (redirectAfterAuth) => set({ redirectAfterAuth }),
      _setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ guestActive: state.guestActive }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
