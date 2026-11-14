// Avatar — initials-based display. Image URI support arrives in P06.
// Initials work for Arabic and Latin names using .charAt(0) — no
// localized strings rendered; caller provides the name.

import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<AvatarSize, { size: number; font: 'captionStrong' | 'bodyStrong' | 'h3' | 'h2' | 'h1' }> = {
  xs: { size: 24, font: 'captionStrong' },
  sm: { size: 32, font: 'captionStrong' },
  md: { size: 44, font: 'bodyStrong' },
  lg: { size: 64, font: 'h3' },
  xl: { size: 96, font: 'h1' },
};

export interface AvatarProps {
  readonly name: string;
  readonly size?: AvatarSize;
  /** Show a gold ring around the avatar. */
  readonly ring?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]!.charAt(0).toUpperCase();
  const first = words[0]!.charAt(0);
  const last = words[words.length - 1]!.charAt(0);
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 'md', ring = false, style, testID }: AvatarProps) {
  const theme = useTheme();
  const spec = SIZES[size];
  const initials = getInitials(name);
  const ringThickness = Math.max(2, Math.round(spec.size * 0.045));
  const outer = spec.size + ringThickness * 2 + 4;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderWidth: ring ? ringThickness : 0,
          borderColor: ring ? theme.colors.gold.fill : 'transparent',
          padding: ring ? 2 : 0,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={name}
    >
      <View
        style={[
          styles.circle,
          {
            width: spec.size,
            height: spec.size,
            borderRadius: spec.size / 2,
            backgroundColor: theme.colors.accent.fill,
          },
        ]}
      >
        <Text variant={spec.font} color="primary">
          {initials}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
