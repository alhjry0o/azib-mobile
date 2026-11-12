// Optional haptics. Can be disabled globally.
// On Web, expo-haptics is a no-op.

import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { create } from 'zustand';

export interface HapticsSettings {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useHapticsStore = create<HapticsSettings>()((set) => ({
  enabled: true,
  setEnabled: (enabled) => set({ enabled }),
}));

export interface HapticsApi {
  readonly enabled: boolean;
  readonly setEnabled: (enabled: boolean) => void;
  light(): void;
  medium(): void;
  success(): void;
  error(): void;
}

export function useHaptics(): HapticsApi {
  const enabled = useHapticsStore((s) => s.enabled);
  const setEnabled = useHapticsStore((s) => s.setEnabled);

  return useMemo<HapticsApi>(() => {
    const safe = (fn: () => Promise<void>) => {
      if (!enabled) return;
      fn().catch(() => {
        // Swallow — haptics are non-essential and must never crash the app.
      });
    };
    return {
      enabled,
      setEnabled,
      light: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
      medium: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
      success: () =>
        safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
      error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
    };
  }, [enabled, setEnabled]);
}
