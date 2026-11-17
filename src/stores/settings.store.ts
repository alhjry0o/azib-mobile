// Client preferences only (ADR-0002). No server data, no PII, no tokens.
// Server-side enforcement of visibility/consents lands with P18.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NumberSystem = 'latn' | 'arab';
/** Only dark exists today (P04). Light/system are offered later. */
export type AppearanceMode = 'dark';
export type ProfileVisibility = 'private' | 'reviewers';
export type NotificationCategory = 'assistance' | 'weddings' | 'marketplace';

export interface NotificationPrefs {
  readonly enabled: boolean;
  readonly assistance: boolean;
  readonly weddings: boolean;
  readonly marketplace: boolean;
}

export interface SettingsState {
  numberSystem: NumberSystem;
  appearance: AppearanceMode;
  visibility: ProfileVisibility;
  /** Optional consent: publishing success stories. Default off. */
  storiesConsent: boolean;
  notifications: NotificationPrefs;
  hydrated: boolean;
  setNumberSystem: (value: NumberSystem) => void;
  setAppearance: (value: AppearanceMode) => void;
  setVisibility: (value: ProfileVisibility) => void;
  setStoriesConsent: (value: boolean) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setNotificationCategory: (category: NotificationCategory, value: boolean) => void;
  /** Internal: used by persist middleware only. */
  _setHydrated: (hydrated: boolean) => void;
}

export const SETTINGS_STORAGE_KEY = 'azib.settings.v1';

const DEFAULT_NOTIFICATIONS: NotificationPrefs = Object.freeze({
  enabled: true,
  assistance: true,
  weddings: true,
  marketplace: false,
});

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      numberSystem: 'latn',
      appearance: 'dark',
      visibility: 'private',
      storiesConsent: false,
      notifications: DEFAULT_NOTIFICATIONS,
      hydrated: false,
      setNumberSystem: (numberSystem) => set({ numberSystem }),
      setAppearance: (appearance) => set({ appearance }),
      setVisibility: (visibility) => set({ visibility }),
      setStoriesConsent: (storiesConsent) => set({ storiesConsent }),
      setNotificationsEnabled: (value) =>
        set((state) => ({ notifications: { ...state.notifications, enabled: value } })),
      setNotificationCategory: (category, value) =>
        set((state) => ({ notifications: { ...state.notifications, [category]: value } })),
      _setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        numberSystem: state.numberSystem,
        appearance: state.appearance,
        visibility: state.visibility,
        storiesConsent: state.storiesConsent,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
