import { semanticColors } from '../colors';
import { durations, easings, springs } from '../motion';
import { radius } from '../radius';
import { glows, shadows } from '../shadows';
import { MIN_TOUCH_TARGET, spacing } from '../spacing';
import { fontFamilies, typography } from '../typography';

export const darkTheme = {
  name: 'dark' as const,
  colors: semanticColors,
  typography,
  fontFamilies,
  spacing,
  minTouchTarget: MIN_TOUCH_TARGET,
  radius,
  shadows,
  glows,
  durations,
  easings,
  springs,
} as const;

export type Theme = typeof darkTheme;
