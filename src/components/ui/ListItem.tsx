import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export type ListItemVariant = 'default' | 'card';

export interface ListItemProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly onPress?: () => void;
  readonly disabled?: boolean;
  readonly destructive?: boolean;
  readonly variant?: ListItemVariant;
  /**
   * Show a chevron at the end. Defaults to true when `onPress` is provided
   * AND `trailing` is not. Set explicitly to override.
   */
  readonly showChevron?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  disabled = false,
  destructive = false,
  variant = 'default',
  showChevron,
  style,
  testID,
}: ListItemProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const haptics = useHaptics();

  const isInteractive = !!onPress;
  const resolvedShowChevron = showChevron ?? (isInteractive && !trailing);

  const baseStyle: ViewStyle = {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    minHeight: 56,
    backgroundColor: variant === 'card' ? theme.colors.bg.surface : 'transparent',
    borderRadius: variant === 'card' ? theme.radius.lg : 0,
    borderWidth: variant === 'card' ? 1 : 0,
    borderColor: variant === 'card' ? theme.colors.border.subtle : 'transparent',
    opacity: disabled ? 0.45 : 1,
  };

  const content = (
    <>
      {leading ? <View>{leading}</View> : null}
      <View style={styles.textBlock}>
        <Text
          variant="bodyStrong"
          color={destructive ? theme.colors.state.danger : 'primary'}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="secondary" numberOfLines={2} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
      {resolvedShowChevron ? (
        <Icon name="chevronRight" size={18} color={theme.colors.text.secondary} />
      ) : null}
    </>
  );

  if (!isInteractive) {
    return (
      <View style={[baseStyle, style]} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={() => {
        if (disabled) return;
        haptics.light();
        onPress();
      }}
      disabled={disabled}
      testID={testID}
      style={({ pressed }) => [baseStyle, pressed && !disabled && styles.pressed, style]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  textBlock: { flex: 1 },
  pressed: { opacity: 0.75 },
});
