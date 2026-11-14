// ArchHero — Islamic/Yemeni-style arch frame.
// Uses borderTopLeftRadius: 9999 which RN clamps to width/2,
// producing a perfect semicircle top without SVG or onLayout.

import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export type ArchHeroVariant = 'filled' | 'outlined';

export interface ArchHeroProps {
  readonly children: ReactNode;
  /** Width in dp. Height is computed from aspectRatio. */
  readonly width: number;
  /** Default 3/4 (height = width * 4/3, taller than wide). */
  readonly aspectRatio?: number;
  readonly variant?: ArchHeroVariant;
  readonly borderColor?: string;
  readonly borderWidth?: number;
  readonly backgroundColor?: string;
  readonly padding?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function ArchHero({
  children,
  width,
  aspectRatio = 3 / 4,
  variant = 'filled',
  borderColor,
  borderWidth = 2,
  backgroundColor,
  padding = 24,
  style,
  testID,
}: ArchHeroProps) {
  const theme = useTheme();
  const border = borderColor ?? theme.colors.gold.fill;
  const bg =
    variant === 'outlined'
      ? 'transparent'
      : backgroundColor ?? theme.colors.bg.surface;

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          width,
          aspectRatio,
          backgroundColor: bg,
          borderColor: border,
          borderWidth,
          padding,
        },
        style,
      ]}
    >
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderTopLeftRadius: 9999,
    borderTopRightRadius: 9999,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
