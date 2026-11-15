// Animated brand splash shown after fonts are ready (native splash handoff).
// Qamariya pattern fades in while two rings unite (marriage symbol).
// Short, always skippable. Under Reduce Motion: static brand, shorter hold.
// All durations pass through useMotion().duration() (DESIGN_SYSTEM rule).
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QamariyaPattern } from '@/components/brand';
import { Button, Text } from '@/components/ui';
import { useMotion } from '@/hooks';
import { useTheme } from '@/theme';

const MOTION_MS = 1400;
const TOTAL_MS = 2200;
const REDUCED_TOTAL_MS = 900;

export interface AnimatedSplashProps {
  readonly onFinish: () => void;
  readonly testID?: string;
}

export function AnimatedSplash({ onFinish, testID = 'animated-splash' }: AnimatedSplashProps) {
  const theme = useTheme();
  const motion = useMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const progress = useSharedValue(0);
  const finishedRef = useRef(false);

  const finish = useCallback((): void => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    if (motion.reduceMotion) {
      progress.value = 1;
    } else {
      progress.value = 0;
      progress.value = withTiming(1, { duration: motion.duration(MOTION_MS) });
    }
    const timer = setTimeout(finish, motion.reduceMotion ? REDUCED_TOTAL_MS : TOTAL_MS);
    return () => clearTimeout(timer);
  }, [motion, progress, finish]);

  const patternStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const leftRingStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + 0.8 * progress.value,
    transform: [{ translateX: -70 + 56 * progress.value }],
  }));
  const rightRingStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + 0.8 * progress.value,
    transform: [{ translateX: 70 - 56 * progress.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View
      accessibilityViewIsModal
      testID={testID}
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: theme.colors.bg.canvas }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, patternStyle]} pointerEvents="none">
        <QamariyaPattern width={width} height={height} opacity={0.1} />
      </Animated.View>
      <View style={styles.center}>
        <View style={styles.rings}>
          <Animated.View
            testID="splash-ring-left"
            style={[styles.ring, { borderColor: theme.colors.gold.fill }, leftRingStyle]}
          />
          <Animated.View
            testID="splash-ring-right"
            style={[styles.ring, { borderColor: theme.colors.accent.text }, rightRingStyle]}
          />
        </View>
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text variant="display" color="gold" align="center">
            {t('common:appName')}
          </Text>
          <Text variant="body" color="secondary" align="center">
            {t('onboarding:splash.tagline')}
          </Text>
        </Animated.View>
      </View>
      <View style={[styles.skipWrap, { bottom: insets.bottom + theme.spacing[6] }]}>
        <Button
          variant="ghost"
          size="sm"
          label={t('common:buttons.skip')}
          onPress={finish}
          testID="splash-skip"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  rings: { width: 180, height: 100, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
  },
  textBlock: { alignItems: 'center', gap: 8, paddingHorizontal: 24 },
  skipWrap: { position: 'absolute', alignSelf: 'center' },
});
