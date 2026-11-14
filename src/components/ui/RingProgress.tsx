// RingProgress — circular determinate progress (no animation in P04).
// Rendered with react-native-svg. Value transitions will be animated in P05
// when wired to real data via Reanimated.

import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/theme';

import { Text } from './Text';

export interface RingProgressProps {
  /** 0..1. Values outside the range are clamped. */
  readonly value: number;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly color?: string;
  readonly trackColor?: string;
  readonly showLabel?: boolean;
  /** Custom center label; defaults to `${percent}%` when showLabel is true. */
  readonly label?: string;
  readonly testID?: string;
}

export function RingProgress({
  value,
  size = 80,
  strokeWidth = 6,
  color,
  trackColor,
  showLabel = false,
  label,
  testID,
}: RingProgressProps) {
  const theme = useTheme();
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);
  const center = size / 2;

  const resolvedColor = color ?? theme.colors.accent.fill;
  const resolvedTrack = trackColor ?? theme.colors.bg.raised;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      accessibilityLabel={`${percent}%`}
      testID={testID}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {showLabel ? (
        <View style={styles.center} pointerEvents="none">
          <Text variant="h3" color="primary">
            {label ?? `${percent}%`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
