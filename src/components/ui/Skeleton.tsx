import { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotion } from '@/hooks';
import { useTheme } from '@/theme';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

export interface SkeletonProps {
  readonly variant?: SkeletonVariant;
  readonly width?: DimensionValue;
  readonly height?: DimensionValue;
  readonly radius?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  radius,
  style,
  testID,
}: SkeletonProps) {
  const theme = useTheme();
  const motion = useMotion();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (motion.reduceMotion) {
      opacity.value = 0.5;
      return;
    }
    opacity.value = 0.35;
    opacity.value = withRepeat(withTiming(0.85, { duration: 900 }), -1, true);
    return () => {
      cancelAnimation(opacity);
    };
  }, [motion.reduceMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const resolvedWidth: DimensionValue =
    width ?? (variant === 'text' ? '100%' : variant === 'circle' ? 48 : '100%');
  const resolvedHeight: DimensionValue =
    height ?? (variant === 'text' ? 14 : variant === 'circle' ? 48 : 80);
  const resolvedRadius: number =
    radius ??
    (variant === 'circle'
      ? typeof resolvedWidth === 'number'
        ? resolvedWidth / 2
        : 9999
      : variant === 'text'
        ? 4
        : theme.radius.md);

  return (
    <Animated.View
      style={[
        {
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
          backgroundColor: theme.colors.bg.raised,
        },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const _styles = StyleSheet.create({});
