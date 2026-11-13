import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';

import { useDirection, useHaptics, useMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface DialogProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly description?: string;
  readonly children?: ReactNode;
  /** Close the dialog when the backdrop is pressed. Default true. */
  readonly dismissOnBackdrop?: boolean;
  /** Show the X close button in the header. Default true. */
  readonly showCloseButton?: boolean;
  readonly testID?: string;
}

/**
 * Modal dialog. Renders a centered surface with a backdrop.
 * Do NOT open a Dialog and a BottomSheet at the same time —
 * iOS Modal stacking is fragile.
 */
export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  dismissOnBackdrop = true,
  showCloseButton = true,
  testID,
}: DialogProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const motion = useMotion();
  const haptics = useHaptics();
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.96));

  useEffect(() => {
    if (!visible) return;
    const dur = motion.duration(200);
    if (dur === 0) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }
    opacity.setValue(0);
    scale.setValue(0.96);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: dur, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: dur, useNativeDriver: true }),
    ]).start();
  }, [visible, motion, opacity, scale]);

  const handleBackdrop = () => {
    if (!dismissOnBackdrop) return;
    haptics.light();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.backdrop, { backgroundColor: theme.colors.bg.overlay, opacity }]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackdrop}
          accessibilityRole="button"
          accessibilityLabel="close"
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.surface,
            {
              backgroundColor: theme.colors.bg.raised,
              borderRadius: theme.radius.xl,
              padding: theme.spacing[5],
              transform: [{ scale }],
            },
          ]}
          testID={testID}
        >
          {(title || showCloseButton) && (
            <View
              style={[
                styles.header,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              {title ? (
                <Text variant="h2" style={styles.title}>
                  {title}
                </Text>
              ) : (
                <View style={styles.title} />
              )}
              {showCloseButton ? (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    onClose();
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="close"
                  testID={testID ? `${testID}-close` : undefined}
                >
                  <Icon name="x" size={22} color={theme.colors.text.secondary} />
                </Pressable>
              ) : null}
            </View>
          )}
          {description ? (
            <Text variant="body" color="secondary" style={styles.description}>
              {description}
            </Text>
          ) : null}
          {children ? <View style={{ marginTop: theme.spacing[4] }}>{children}</View> : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  surface: { width: '100%', maxWidth: 420 },
  header: { alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1 },
  description: { marginTop: 8 },
});
