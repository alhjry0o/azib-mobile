import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMotion } from '@/hooks';
import { useTheme } from '@/theme';

export interface BottomSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly dismissOnBackdrop?: boolean;
  readonly showHandle?: boolean;
  /** Max height as percent of the screen (0-100). Default 85. */
  readonly maxHeightPercent?: number;
  readonly testID?: string;
}

/**
 * Modal bottom sheet. Single snap (maxHeightPercent of screen).
 * Drag down to dismiss (threshold 100px or vy > 0.5).
 * Do NOT open a Dialog and a BottomSheet at the same time.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  dismissOnBackdrop = true,
  showHandle = true,
  maxHeightPercent = 85,
  testID,
}: BottomSheetProps) {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const sheetHeight = (screenHeight * maxHeightPercent) / 100;

  const [translateY] = useState(() => new Animated.Value(sheetHeight));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    const dur = motion.duration(220);
    if (dur === 0) {
      translateY.setValue(0);
      opacity.setValue(1);
      return;
    }
    translateY.setValue(sheetHeight);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: dur, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: dur, useNativeDriver: true }),
    ]).start();
  }, [visible, motion, translateY, opacity, sheetHeight]);

  const close = () => {
    const dur = motion.duration(200);
    if (dur === 0) {
      onClose();
      return;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: dur,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, { toValue: 0, duration: dur, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 6 && g.dy > 0,
        onPanResponderMove: (_e, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_e, g) => {
          if (g.dy > 100 || g.vy > 0.5) {
            close();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              damping: 20,
              stiffness: 200,
            }).start();
          }
        },
      }),
    // close is stable enough for the lifetime of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [translateY, sheetHeight],
  );

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
          onPress={() => {
            if (dismissOnBackdrop) close();
          }}
          accessibilityRole="button"
          accessibilityLabel="close"
          testID={testID ? `${testID}-backdrop` : undefined}
        />
        <Animated.View
          accessibilityViewIsModal
          {...panResponder.panHandlers}
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.bg.raised,
              borderTopStartRadius: theme.radius.xl,
              borderTopEndRadius: theme.radius.xl,
              height: sheetHeight,
              paddingBottom: insets.bottom + theme.spacing[4],
              transform: [{ translateY }],
            },
          ]}
          testID={testID}
        >
          {showHandle ? (
            <View style={styles.handleRow} pointerEvents="none">
              <View style={[styles.handle, { backgroundColor: theme.colors.border.strong }]} />
            </View>
          ) : null}
          <View style={{ flex: 1, paddingHorizontal: theme.spacing[4] }}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  handleRow: { alignItems: 'center', paddingVertical: 10 },
  handle: { width: 40, height: 4, borderRadius: 2 },
});
