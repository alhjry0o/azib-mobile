import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'verified'
  | 'pending'
  | 'demo';

export type BadgeSize = 'sm' | 'md';

interface BadgePalette {
  readonly bg: string;
  readonly fg: string;
  readonly icon?: IconName;
}

export interface BadgeProps {
  readonly label: string;
  readonly variant?: BadgeVariant;
  readonly size?: BadgeSize;
  readonly testID?: string;
}

export function Badge({ label, variant = 'neutral', size = 'md', testID }: BadgeProps) {
  const theme = useTheme();

  const resolve = (): BadgePalette => {
    switch (variant) {
      case 'verified':
        return { bg: 'rgba(63,207,142,0.14)', fg: theme.colors.state.success, icon: 'checkCircle' };
      case 'pending':
        return { bg: 'rgba(217,169,40,0.16)', fg: theme.colors.gold.text, icon: 'clock' };
      case 'demo':
        return { bg: 'rgba(155,92,255,0.16)', fg: theme.colors.text.accent, icon: 'sparkles' };
      case 'success':
        return { bg: 'rgba(63,207,142,0.14)', fg: theme.colors.state.success };
      case 'warning':
        return { bg: 'rgba(217,169,40,0.16)', fg: theme.colors.gold.text };
      case 'danger':
        return { bg: 'rgba(255,92,122,0.16)', fg: theme.colors.state.danger };
      case 'info':
        return { bg: 'rgba(92,168,255,0.16)', fg: theme.colors.state.info };
      case 'accent':
        return { bg: theme.colors.accent.fill, fg: theme.colors.text.primary };
      case 'neutral':
      default:
        return { bg: theme.colors.bg.raised, fg: theme.colors.text.secondary };
    }
  };

  const palette = resolve();
  const isSmall = size === 'sm';
  const iconSize = isSmall ? 10 : 12;

  return (
    <View
      accessibilityRole="text"
      style={[
        styles.container,
        {
          backgroundColor: palette.bg,
          borderRadius: theme.radius.full,
          paddingHorizontal: isSmall ? 6 : 8,
          paddingVertical: isSmall ? 2 : 3,
          gap: palette.icon ? (isSmall ? 3 : 4) : 0,
        },
      ]}
      testID={testID}
    >
      {palette.icon ? <Icon name={palette.icon} size={iconSize} color={palette.fg} /> : null}
      <Text variant={isSmall ? 'caption' : 'captionStrong'} color={palette.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});
