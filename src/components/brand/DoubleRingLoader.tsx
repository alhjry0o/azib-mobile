// DoubleRingLoader — two interlocking rings rotating continuously.
// Uses Reanimated SharedValue + withRepeat. When reduceMotion is true,
// the rings stay static (still visible, no motion).

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useMotion } from '@/hooks';
import { useTheme } from '@/theme';

export interface DoubleRingLoaderProps {
  readonly size?: number;
  readonly color?: string;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
}

export function DoubleRingLoader({
  size = 64,
  color,
  testID,
  accessibilityLabel = 'loading',
}: DoubleRingLoaderProps) {
  const theme = useTheme();
  const motion = useMotion();
  const stroke = color ?? theme.colors.accent.fill;
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (motion.reduceMotion) {
      rotation.value = 0;
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: 1400 }), -1, false);
    return () => {
      cancelAnimation(rotation);
    };
  }, [motion.reduceMotion, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const strokeWidth = Math.max(2, size * 0.06);
  const outerR = size / 2 - strokeWidth / 2 - 2;
  const innerR = outerR * 0.62;
  const cx = size / 2;
  const cy = size / 2;
  const ringOffset = outerR * 0.35;

  const outerDash = 2 * Math.PI * outerR * 0.72;
  const innerDash = 2 * Math.PI * innerR * 0.62;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <Animated.View style={[{ width: size, height: size }, animatedStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Outer / left ring */}
          <Circle
            cx={cx - ringOffset}
            cy={cy}
            r={outerR}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${outerDash} ${2 * Math.PI * outerR}`}
            fill="none"
          />
          {/* Inner / right ring (interlocks with outer) */}
          <Circle
            cx={cx + ringOffset}
            cy={cy}
            r={innerR}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${innerDash} ${2 * Math.PI * innerR}`}
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
