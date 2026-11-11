// Shadows for iOS (shadow*) + Android (elevation).
// Glows rely on shadowColor; disable on Tier low (see useDeviceTier in Part 2+).

import type { ViewStyle } from 'react-native';

export const shadows = {
  none: {} as ViewStyle,
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
} as const;

export const glows = {
  none: {} as ViewStyle,
  purple: {
    shadowColor: '#9B5CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 0,
  } as ViewStyle,
  gold: {
    shadowColor: '#F0CA68',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 0,
  } as ViewStyle,
} as const;

export type Shadows = typeof shadows;
export type Glows = typeof glows;
