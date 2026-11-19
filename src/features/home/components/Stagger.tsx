// Entrance stagger capped at 8 items (brief §7). Reduce Motion ⇒ instant.
import { useEffect, type ReactNode } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useMotion } from '@/hooks';

export const MAX_STAGGER_ITEMS = 8;
export const STAGGER_STEP_MS = 60;

export interface StaggerProps {
  readonly index: number;
  readonly children: ReactNode;
  readonly testID?: string;
}

export function Stagger({ index, children, testID }: StaggerProps) {
  const motion = useMotion();
  const progress = useSharedValue(1);

  useEffect(() => {
    if (motion.reduceMotion) {
      progress.value = 1;
      return;
    }
    const capped = Math.min(Math.max(index, 0), MAX_STAGGER_ITEMS - 1);
    progress.value = 0;
    progress.value = withDelay(
      capped * STAGGER_STEP_MS,
      withTiming(1, { duration: motion.duration(240) }),
    );
  }, [index, motion, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  return (
    <Animated.View style={style} testID={testID}>
      {children}
    </Animated.View>
  );
}
