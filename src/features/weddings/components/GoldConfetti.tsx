// Achievement-only celebration. No library: Reanimated + SVG already present.
// Reduce Motion or Tier low ⇒ a static gold badge, never motion.
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useDeviceTier, useMotion } from '@/hooks';
import { useTheme } from '@/theme';

export interface GoldConfettiProps {
  readonly size?: number;
  readonly testID?: string;
}

const PIECES = [
  { x: 0.18, y: 0.22, r: 3 },
  { x: 0.42, y: 0.12, r: 2 },
  { x: 0.68, y: 0.26, r: 3 },
  { x: 0.82, y: 0.48, r: 2 },
  { x: 0.28, y: 0.62, r: 2 },
  { x: 0.58, y: 0.74, r: 3 },
] as const;

export function GoldConfetti({ size = 120, testID }: GoldConfettiProps) {
  const theme = useTheme();
  const motion = useMotion();
  const { isLow } = useDeviceTier();
  const drift = useSharedValue(0);
  const animated = !motion.reduceMotion && !isLow;

  useEffect(() => {
    if (!animated) {
      drift.value = 0;
      return;
    }
    drift.value = withRepeat(withTiming(1, { duration: motion.duration(1800) }), -1, true);
    return () => {
      cancelAnimation(drift);
    };
  }, [animated, drift, motion]);

  const style = useAnimatedStyle(() => ({
    opacity: animated ? 0.55 + drift.value * 0.45 : 0.8,
    transform: [{ translateY: animated ? -drift.value * 6 : 0 }],
  }));

  return (
    <View style={[styles.wrapper, { width: size, height: size }]} testID={testID}>
      <Animated.View style={[StyleSheet.absoluteFill, style]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {PIECES.map((piece, index) =>
            index % 2 === 0 ? (
              <Circle
                key={index}
                cx={piece.x * size}
                cy={piece.y * size}
                r={piece.r}
                fill={theme.colors.gold.fill}
              />
            ) : (
              <Rect
                key={index}
                x={piece.x * size}
                y={piece.y * size}
                width={piece.r * 2}
                height={piece.r}
                rx={1}
                fill={theme.colors.gold.text}
              />
            ),
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
});
