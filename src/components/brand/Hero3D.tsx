// Hero3D — three-layer parallax hero (ADR-0003).
// Caller passes a SharedValue<number> `progress` (0..1) that they
// drive from a scroll handler or a gesture. Each layer translates
// at a different rate — background slowest, foreground static.
//
// On Tier low or Reduce Motion, layers are laid out flat (no parallax).

import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useDeviceTier, useMotion } from '@/hooks';

export interface Hero3DProps {
  /** SharedValue in range 0..1. Typically driven by scroll/gesture. */
  readonly progress: SharedValue<number>;
  readonly background?: ReactNode;
  readonly midground?: ReactNode;
  readonly foreground: ReactNode;
  readonly height?: number;
  readonly testID?: string;
}

export function Hero3D({
  progress,
  background,
  midground,
  foreground,
  height = 400,
  testID,
}: Hero3DProps) {
  const { isLow } = useDeviceTier();
  const motion = useMotion();
  const enabled = !isLow && !motion.reduceMotion;

  const bgStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: enabled ? -progress.value * 12 : 0 },
      { scale: 1.08 },
    ],
  }));

  const mgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: enabled ? -progress.value * 36 : 0 }],
  }));

  const fgStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: enabled ? -progress.value * 72 : 0 }],
  }));

  return (
    <View style={[styles.container, { height }]} testID={testID}>
      {background ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, bgStyle]}
          pointerEvents="none"
        >
          {background}
        </Animated.View>
      ) : null}
      {midground ? (
        <Animated.View
          style={[StyleSheet.absoluteFill, mgStyle]}
          pointerEvents="none"
        >
          {midground}
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.foreground, fgStyle]}>{foreground}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  foreground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
