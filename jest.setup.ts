// Global test setup. Extend as testing grows (P21).

// Test-mode environment variables (parsed by src/config/env.ts).
process.env.EXPO_PUBLIC_ENV = 'local';
process.env.EXPO_PUBLIC_APP_MODE = 'development';
process.env.EXPO_PUBLIC_SUPABASE_URL = '';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = '';

// AsyncStorage mock (used by Zustand persist in tests).
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock lucide-react-native to avoid ESM parsing errors in Jest.
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, props);
  return new Proxy({}, { get: () => MockIcon });
});
/* eslint-enable @typescript-eslint/no-require-imports */
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================================
// react-native-reanimated — static Jest mock (no worklets).
// Used only in test env. On device, the real library takes over.
// ============================================================
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RN = require('react-native');
  const identity = (v: unknown) => v;
  const shared = (init: unknown) => ({ value: init });
  const AnimatedView = RN.View;
  const AnimatedText = RN.Text;
  const AnimatedScrollView = RN.ScrollView;
  const AnimatedImage = RN.Image;

  const chainableGesture = (): Record<string, unknown> => {
    const g: Record<string, unknown> = {};
    const self = () => g;
    g.onStart = self; g.onUpdate = self; g.onEnd = self; g.onBegin = self;
    g.onFinalize = self; g.onChange = self; g.enabled = self; g.minDistance = self;
    return g;
  };

  return {
    __esModule: true,
    default: { View: AnimatedView, Text: AnimatedText, ScrollView: AnimatedScrollView, Image: AnimatedImage, createAnimatedComponent: identity },
    View: AnimatedView, Text: AnimatedText, ScrollView: AnimatedScrollView, Image: AnimatedImage, createAnimatedComponent: identity,
    useSharedValue: (v: unknown) => shared(v),
    useAnimatedStyle: (fn: () => object) => fn(),
    useAnimatedProps: (fn: () => object) => fn(),
    useDerivedValue: (fn: () => unknown) => shared(fn()),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: (fn: unknown) => fn,
    useAnimatedReaction: () => {},
    useAnimatedGestureHandler: () => ({}),
    withTiming: (v: unknown) => v, withSpring: (v: unknown) => v, withRepeat: (v: unknown) => v,
    withDelay: (_d: number, v: unknown) => v, withSequence: (...v: unknown[]) => v[v.length - 1],
    withDecay: (v: unknown) => v, cancelAnimation: () => {},
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn, runOnUI: (fn: (...args: unknown[]) => unknown) => fn,
    interpolate: identity,
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Easing: { linear: identity, ease: identity, inOut: (v: unknown) => v, bezier: () => identity, out: (v: unknown) => v, in: (v: unknown) => v, elastic: () => identity, quad: identity, cubic: identity },
    Gesture: { Pan: chainableGesture, Tap: chainableGesture, LongPress: chainableGesture, Pinch: chainableGesture, Rotation: chainableGesture },
    GestureDetector: ({ children }: { children: unknown }) => children,
  };
});
