// GlassView — glass blur effect (Dock + Sheet only, per AGENT_RULES).
// Falls back to a semi-transparent surface on Tier low or unsupported platforms.

import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useDeviceTier } from '@/hooks';
import { useTheme } from '@/theme';

export interface GlassViewProps {
  readonly children: ReactNode;
  /** 0–100. Default 60. Ignored on Tier low. */
  readonly intensity?: number;
  readonly tint?: 'light' | 'dark' | 'default';
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function GlassView({
  children,
  intensity = 60,
  tint = 'dark',
  style,
  testID,
}: GlassViewProps) {
  const theme = useTheme();
  const { isLow } = useDeviceTier();
  const allowBlur = !isLow;

  const baseStyle: ViewStyle = {
    backgroundColor: 'rgba(30, 24, 50, 0.72)',
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    overflow: 'hidden',
  };

  if (allowBlur) {
    return (
      <BlurView intensity={intensity} tint={tint} style={[baseStyle, style]} testID={testID}>
        {children}
      </BlurView>
    );
  }

  return (
    <View
      style={[baseStyle, { backgroundColor: 'rgba(30, 24, 50, 0.92)' }, style]}
      testID={testID}
    >
      {children}
    </View>
  );
}
