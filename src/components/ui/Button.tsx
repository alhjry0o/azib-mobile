import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useDeviceTier, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';
import type { Theme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface VariantColors {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
  readonly glow?: string;
}

function resolveVariantColors(variant: ButtonVariant, theme: Theme): VariantColors {
  switch (variant) {
    case 'primary':
      return {
        bg: theme.colors.accent.fill,
        text: theme.colors.text.primary,
        border: 'transparent',
        glow: theme.colors.accent.glow,
      };
    case 'secondary':
      return {
        bg: theme.colors.bg.raised,
        text: theme.colors.text.primary,
        border: theme.colors.border.subtle,
      };
    case 'ghost':
      return {
        bg: 'transparent',
        text: theme.colors.text.primary,
        border: 'transparent',
      };
    case 'gold':
      return {
        bg: theme.colors.gold.fill,
        text: theme.colors.text.inverse,
        border: 'transparent',
        glow: theme.colors.gold.glow,
      };
    case 'danger':
      return {
        bg: theme.colors.state.danger,
        text: theme.colors.text.primary,
        border: 'transparent',
      };
    case 'icon':
      return {
        bg: theme.colors.bg.raised,
        text: theme.colors.text.primary,
        border: theme.colors.border.subtle,
      };
  }
}

interface SizeSpec {
  readonly height: number;
  readonly paddingX: number;
  readonly iconSize: number;
  readonly textVariant: 'bodyStrong' | 'body' | 'caption';
}

function resolveSize(size: ButtonSize): SizeSpec {
  switch (size) {
    case 'sm':
      return { height: 44, paddingX: 14, iconSize: 16, textVariant: 'caption' };
    case 'md':
      return { height: 48, paddingX: 20, iconSize: 18, textVariant: 'bodyStrong' };
    case 'lg':
      return { height: 56, paddingX: 24, iconSize: 20, textVariant: 'bodyStrong' };
  }
}

export interface ButtonProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Text label (visible string). Mutually exclusive with `i18nKey`. */
  readonly label?: string;
  /** i18n key for label. Mutually exclusive with `label`. */
  readonly i18nKey?: string;
  /** Left icon (before text). Required when variant='icon'. */
  readonly leftIcon?: IconName;
  /** Right icon (after text). */
  readonly rightIcon?: IconName;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly error?: boolean;
  readonly fullWidth?: boolean;
  readonly onPress?: PressableProps['onPress'];
  readonly onLongPress?: PressableProps['onLongPress'];
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  i18nKey,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  error = false,
  fullWidth = false,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const { isHigh, isMid } = useDeviceTier();
  const haptics = useHaptics();
  const [focused, setFocused] = useState(false);

  const colors = resolveVariantColors(variant, theme);
  const spec = resolveSize(size);
  const isIconOnly = variant === 'icon';
  const isDisabled = disabled || loading;
  const allowGlow = isHigh || isMid;
  const iconVisual = leftIcon ?? rightIcon;

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (isDisabled) return;
      haptics.light();
      onPress?.(e);
    },
    [haptics, isDisabled, onPress],
  );

  const glowStyle =
    colors.glow && allowGlow && !isDisabled
      ? Platform.select<ViewStyle>({
          ios: {
            shadowColor: colors.glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 14,
          },
          android: { elevation: 4 },
          default: {
            shadowColor: colors.glow,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 14,
          },
        })
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      onPress={handlePress}
      onLongPress={onLongPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        {
          height: spec.height,
          paddingHorizontal: isIconOnly ? 0 : spec.paddingX,
          width: isIconOnly ? spec.height : undefined,
          borderRadius: isIconOnly ? spec.height / 2 : theme.radius.lg,
          backgroundColor: colors.bg,
          borderColor: error ? theme.colors.state.danger : colors.border,
        },
        glowStyle,
        fullWidth && !isIconOnly && styles.fullWidth,
        focused && { borderColor: theme.colors.text.accent, borderWidth: 2 },
        pressed && !isDisabled && styles.pressed,
        disabled && !loading && styles.disabledLook,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" testID="button-loading" />
      ) : isIconOnly ? (
        iconVisual ? <Icon name={iconVisual} size={spec.iconSize} color={colors.text} /> : null
      ) : (
        <View style={styles.contentRow}>
          {leftIcon ? <Icon name={leftIcon} size={spec.iconSize} color={colors.text} /> : null}
          {label || i18nKey ? (
            <Text variant={spec.textVariant} color={colors.text} i18nKey={i18nKey}>
              {label}
            </Text>
          ) : null}
          {rightIcon ? <Icon name={rightIcon} size={spec.iconSize} color={colors.text} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  disabledLook: {
    opacity: 0.45,
  },
});
