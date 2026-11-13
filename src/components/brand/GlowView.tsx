import type { ReactNode } from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDeviceTier } from '@/hooks';
import { useTheme } from '@/theme';

export type GlowColor = 'accent' | 'gold';

export interface GlowViewProps {
  readonly children: ReactNode;
  readonly color?: GlowColor;
  readonly radius?: number;
  readonly intensity?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function GlowView({
  children,
  color = 'accent',
  radius = 20,
  intensity = 0.45,
  style,
  testID,
}: GlowViewProps) {
  const theme = useTheme();
  const { isLow } = useDeviceTier();
  const allowGlow = !isLow;
  const glowColor = color === 'gold' ? theme.colors.gold.glow : theme.colors.accent.glow;

  const glowStyle: ViewStyle | undefined = allowGlow
    ? Platform.select<ViewStyle>({
        ios: {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: intensity,
          shadowRadius: radius,
        },
        android: { elevation: 6 },
        default: {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: intensity,
          shadowRadius: radius,
        },
      })
    : undefined;

  return (
    <View style={[glowStyle, style]} testID={testID}>
      {children}
    </View>
  );
}
