/**
 * app-mode.store — AppMode (demo | backend) مع persist في AsyncStorage.
 *
 * افتراضي: 'demo' — حتى يقرر المستخدم التحويل إلى backend من Developer Settings (P05).
 * عند التحويل إلى backend بدون إعداد Supabase، الواجهة تعرض Not Connected (تُدار من ProviderContainer في الجزء 3).
 *
 * لا تخزّن هنا أي بيانات حساسة. فقط التفضيل.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppMode = 'demo' | 'backend';

export interface AppModeState {
  /** الوضع الحالي. */
  mode: AppMode;
  /** تُضبط true بعد إعادة التحميل من التخزين. تستخدمها الواجهة لتجنب وميض. */
  hydrated: boolean;
  setMode: (mode: AppMode) => void;
  /** للاستخدام الداخلي فقط من persist middleware. */
  _setHydrated: (hydrated: boolean) => void;
}

export const APP_MODE_STORAGE_KEY = 'azib.app-mode.v1';

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set) => ({
      mode: 'demo',
      hydrated: false,
      setMode: (mode) => set({ mode }),
      _setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: APP_MODE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        state?._setHydrated(true);
      },
    },
  ),
);
