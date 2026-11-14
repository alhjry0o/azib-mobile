// DoubleRingSuccess — animation that plays once on mount:
//   Phase 1 (0 → 0.6): rings visible, solid ring pulses in
//   Phase 2 (0.6 → 1): rings fade out, checkmark fades in
// When reduceMotion is true, jumps directly to the final state (checkmark visible).

import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { useMotion } from '@/hooks';
import { useTheme } from '@/theme';

export interface DoubleRingSuccessProps {
  readonly size?: number;
  readonly color?: string;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
}

export function DoubleRingSuccess({
  size = 72,
  color,
  testID,
  accessibilityLabel = 'success',
}: DoubleRingSuccessProps) {
  const theme = useTheme();
  const motion = useMotion();
  const tint = color ?? theme.colors.state.success;
  const progress = useSharedValue(0);

  useEffect(() => {
    if (motion.reduceMotion) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withTiming(1, { duration: 600 });
  }, [motion.reduceMotion, progress]);

  const ringStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const fade = p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.4);
    return {
      opacity: fade,
      transform: [{ scale: 0.85 + Math.min(p, 1) * 0.15 }],
    };
  });

  const checkStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const t = Math.max(0, (p - 0.5) / 0.5);
    return {
      opacity: t,
      transform: [{ scale: 0.6 + t * 0.4 }],
    };
  });

  const strokeWidth = Math.max(3, size * 0.08);
  const r = size / 2 - strokeWidth / 2 - 2;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={[{ position: 'absolute' }, ringStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={tint}
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute' }, checkStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Path
            d={`M ${size * 0.3} ${size * 0.5} L ${size * 0.44} ${size * 0.64} L ${size * 0.7} ${size * 0.36}`}
            stroke={tint}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
