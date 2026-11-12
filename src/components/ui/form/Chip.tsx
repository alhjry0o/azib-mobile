import { Pressable, StyleSheet, View } from 'react-native';

import { useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from '../Icon';
import { Text } from '../Text';

export type ChipVariant = 'default' | 'accent' | 'gold';

export interface ChipProps {
  readonly label: string;
  readonly selected?: boolean;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly leftIcon?: IconName;
  readonly variant?: ChipVariant;
  readonly testID?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  disabled = false,
  leftIcon,
  variant = 'default',
  testID,
}: ChipProps) {
  const theme = useTheme();
  const haptics = useHaptics();
  const isInteractive = !!onPress;

  const palette =
    variant === 'accent'
      ? { fill: theme.colors.accent.fill, text: theme.colors.text.primary, border: 'transparent' }
      : variant === 'gold'
        ? { fill: theme.colors.gold.fill, text: theme.colors.text.inverse, border: 'transparent' }
        : {
            fill: selected ? theme.colors.accent.fill : 'transparent',
            text: selected ? theme.colors.text.primary : theme.colors.text.secondary,
            border: selected ? theme.colors.accent.fill : theme.colors.border.subtle,
          };

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.fill,
          borderColor: palette.border,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[1],
          opacity: disabled ? 0.45 : 1,
        },
      ]}
    >
      {leftIcon ? <Icon name={leftIcon} size={14} color={palette.text} /> : null}
      <Text variant="captionStrong" color={palette.text}>
        {label}
      </Text>
    </View>
  );

  if (!isInteractive) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      onPress={() => {
        if (disabled) return;
        haptics.light();
        onPress?.();
      }}
      disabled={disabled}
      hitSlop={6}
      testID={testID}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    minHeight: 32,
  },
});
