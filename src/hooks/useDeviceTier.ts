// Device tier determines which visual effects run.
// Low tier: no glows, no shadows, no parallax. Mid: shadows only. High: everything.

import { useMemo } from 'react';
import { PixelRatio, Platform } from 'react-native';
import { create } from 'zustand';

export type DeviceTier = 'high' | 'mid' | 'low';

export interface DeviceTierState {
  tier: DeviceTier;
  override: DeviceTier | null;
  setOverride: (tier: DeviceTier | null) => void;
}

export const useDeviceTierStore = create<DeviceTierState>()((set) => ({
  tier: detectDefaultTier(),
  override: null,
  setOverride: (override) => set({ override }),
}));

function detectDefaultTier(): DeviceTier {
  if (Platform.OS === 'web') return 'high';
  const ratio = PixelRatio.get();
  if (ratio >= 3) return 'high';
  if (ratio >= 2) return 'mid';
  return 'low';
}

export function useDeviceTier(): {
  tier: DeviceTier;
  isHigh: boolean;
  isMid: boolean;
  isLow: boolean;
} {
  const tier = useDeviceTierStore((s) => s.override ?? s.tier);
  return useMemo(
    () => ({
      tier,
      isHigh: tier === 'high',
      isMid: tier === 'mid',
      isLow: tier === 'low',
    }),
    [tier],
  );
}
