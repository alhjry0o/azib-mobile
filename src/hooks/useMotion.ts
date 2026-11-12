// Motion config that respects the OS Reduce Motion setting.
// When reduceMotion is true, `duration(ms)` returns 0 for every animation.

import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export interface MotionConfig {
  readonly reduceMotion: boolean;
  readonly enabled: boolean;
  /** Returns 0 when reduceMotion is true; otherwise returns the input. */
  duration(ms: number): number;
}

export function useMotion(): MotionConfig {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(() => {
        // Some platforms may not implement the check; default to allowing motion.
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReduceMotion(enabled);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return useMemo<MotionConfig>(
    () => ({
      reduceMotion,
      enabled: !reduceMotion,
      duration: (ms: number) => (reduceMotion ? 0 : ms),
    }),
    [reduceMotion],
  );
}
