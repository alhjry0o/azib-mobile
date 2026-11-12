import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDirection, useMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  /** Pre-translated message. Caller uses t('...') before calling show(). */
  readonly message: string;
  readonly variant?: ToastVariant;
  /** Auto-dismiss duration in ms. Default 3000. 0 disables auto-dismiss. */
  readonly duration?: number;
}

interface ToastInternal extends ToastOptions {
  readonly id: number;
}

export interface ToastContextValue {
  show(options: ToastOptions): void;
  hide(): void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  readonly children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const motion = useMotion();
  const insets = useSafeAreaInsets();

  const [toast, setToast] = useState<ToastInternal | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-20));
  const idCounter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    const dur = motion.duration(200);
    if (dur === 0) {
      setToast(null);
      return;
    }
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: dur, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: dur, useNativeDriver: true }),
    ]).start(() => setToast(null));
  }, [motion, opacity, translateY]);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      idCounter.current += 1;
      setToast({ ...options, id: idCounter.current });

      const enterDur = motion.duration(220);
      if (enterDur === 0) {
        opacity.setValue(1);
        translateY.setValue(0);
      } else {
        opacity.setValue(0);
        translateY.setValue(-20);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: enterDur, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: enterDur, useNativeDriver: true }),
        ]).start();
      }

      const duration = options.duration ?? 3000;
      if (duration > 0) {
        timerRef.current = setTimeout(() => hide(), duration);
      }
    },
    [hide, motion, opacity, translateY],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ show, hide }), [hide, show]);

  const variant = toast?.variant ?? 'info';
  const iconName: IconName =
    variant === 'success'
      ? 'checkCircle'
      : variant === 'error'
        ? 'xCircle'
        : variant === 'warning'
          ? 'alertTriangle'
          : 'info';
  const accentColor =
    variant === 'success'
      ? theme.colors.state.success
      : variant === 'error'
        ? theme.colors.state.danger
        : variant === 'warning'
          ? theme.colors.gold.fill
          : theme.colors.state.info;

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {toast ? (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.container,
              {
                paddingTop: insets.top + theme.spacing[3],
                paddingStart: theme.spacing[4],
                paddingEnd: theme.spacing[4],
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={[
                styles.toast,
                {
                  backgroundColor: theme.colors.bg.raised,
                  borderColor: accentColor,
                  borderRadius: theme.radius.md,
                  paddingStart: theme.spacing[3],
                  paddingEnd: theme.spacing[3],
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
              testID="toast"
            >
              <Icon name={iconName} size={20} color={accentColor} />
              <Text variant="body" color="primary" style={styles.message}>
                {toast.message}
              </Text>
              <Pressable
                onPress={hide}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="dismiss"
                testID="toast-dismiss"
              >
                <Icon name="x" size={18} color={theme.colors.text.secondary} />
              </Pressable>
            </View>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>.');
  }
  return ctx;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
  },
  toast: {
    borderWidth: 1,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  message: { flex: 1 },
});
