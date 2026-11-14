import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Text } from './Text';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarColor = 'accent' | 'gold' | 'success' | 'danger';

const HEIGHTS: Record<ProgressBarSize, number> = {
  sm: 4,
  md: 8,
  lg: 12,
};

export interface ProgressBarProps {
  /** 0..1. Omit for indeterminate. */
  readonly value?: number;
  readonly size?: ProgressBarSize;
  readonly color?: ProgressBarColor;
  /** Show a percentage label to the end of the bar. Determinate only. */
  readonly showLabel?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function ProgressBar({
  value,
  size = 'md',
  color = 'accent',
  showLabel = false,
  style,
  testID,
}: ProgressBarProps) {
  const theme = useTheme();
  const motion = useMotion();
  const height = HEIGHTS[size];
  const isIndeterminate = value === undefined;

  const resolvedColor =
    color === 'gold'
      ? theme.colors.gold.fill
      : color === 'success'
        ? theme.colors.state.success
        : color === 'danger'
          ? theme.colors.state.danger
          : theme.colors.accent.fill;

  const clamped = isIndeterminate ? 0 : Math.min(1, Math.max(0, value!));
  const percent = Math.round(clamped * 100);

  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!isIndeterminate) {
      opacity.value = 1;
      return;
    }
    if (motion.reduceMotion) {
      opacity.value = 0.7;
      return;
    }
    opacity.value = 0.4;
    opacity.value = withRepeat(withTiming(0.9, { duration: 900 }), -1, true);
    return () => {
      cancelAnimation(opacity);
    };
  }, [isIndeterminate, motion.reduceMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityValue={
          isIndeterminate
            ? undefined
            : { min: 0, max: 100, now: percent }
        }
        accessibilityLabel={isIndeterminate ? 'loading' : `${percent}%`}
        style={[
          styles.track,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: theme.colors.bg.raised,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: height / 2,
              backgroundColor: resolvedColor,
              width: isIndeterminate ? '100%' : `${percent}%`,
            },
            animatedStyle,
          ]}
        />
      </View>
      {showLabel && !isIndeterminate ? (
        <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
          {`${percent}%`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    start: 0,
  },
});
