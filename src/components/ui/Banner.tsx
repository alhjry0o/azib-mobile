import { Pressable, StyleSheet, View } from 'react-native';

import { useDirection, useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BannerVariant = 'info' | 'demo' | 'warning' | 'error';

interface BannerStyleSpec {
  readonly bg: string;
  readonly border: string;
  readonly accent: string;
  readonly icon: IconName;
}

export interface BannerProps {
  readonly variant?: BannerVariant;
  readonly title?: string;
  readonly message: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly onDismiss?: () => void;
  readonly testID?: string;
}

export function Banner({
  variant = 'info',
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  testID,
}: BannerProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const haptics = useHaptics();

  const spec: BannerStyleSpec =
    variant === 'demo'
      ? {
          bg: theme.colors.gold.fill,
          border: theme.colors.gold.fill,
          accent: theme.colors.text.inverse,
          icon: 'sparkles',
        }
      : variant === 'warning'
        ? {
            bg: theme.colors.bg.raised,
            border: theme.colors.gold.fill,
            accent: theme.colors.gold.fill,
            icon: 'alertTriangle',
          }
        : variant === 'error'
          ? {
              bg: theme.colors.bg.raised,
              border: theme.colors.state.danger,
              accent: theme.colors.state.danger,
              icon: 'xCircle',
            }
          : {
              bg: theme.colors.bg.raised,
              border: theme.colors.state.info,
              accent: theme.colors.state.info,
              icon: 'info',
            };

  // On the gold/demo banner, use inverse (dark) text; on all others, primary (white).
  const textColor = variant === 'demo' ? 'inverse' : 'primary';
  const subTextColor = variant === 'demo' ? 'inverse' : 'secondary';

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        {
          backgroundColor: spec.bg,
          borderColor: spec.border,
          borderRadius: theme.radius.md,
          paddingStart: theme.spacing[3],
          paddingEnd: theme.spacing[3],
          paddingVertical: theme.spacing[3],
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing[2],
        },
      ]}
      testID={testID}
    >
      <View style={styles.iconWrap}>
        <Icon name={spec.icon} size={20} color={spec.accent} />
      </View>
      <View style={styles.body}>
        {title ? (
          <Text variant="bodyStrong" color={textColor} style={styles.title}>
            {title}
          </Text>
        ) : null}
        <Text variant="body" color={subTextColor} style={styles.message}>
          {message}
        </Text>
        {actionLabel && onAction ? (
          <Pressable
            onPress={() => {
              haptics.light();
              onAction();
            }}
            accessibilityRole="button"
            hitSlop={6}
            style={styles.action}
          >
            <Text variant="bodyStrong" color={variant === 'demo' ? 'inverse' : 'accent'}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable
          onPress={() => {
            haptics.light();
            onDismiss();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="dismiss"
          testID={testID ? `${testID}-dismiss` : undefined}
        >
          <Icon name="x" size={18} color={spec.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: 'flex-start',
    minHeight: 44,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    marginBottom: 2,
  },
  message: {
    flexShrink: 1,
  },
  action: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
});
