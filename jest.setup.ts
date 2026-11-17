global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock expo-blur globally to prevent act warnings in tests
jest.mock('expo-blur', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    BlurView: ({ children, style, testID }: any) =>
      React.createElement(View, { style, testID }, children),
  };
});

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

// NetInfo mock (P05): online by default; tests override addEventListener/fetch.
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
  },
}));

// expo-splash-screen mock (P05): no native splash in Jest.
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve(true)),
  hideAsync: jest.fn(() => Promise.resolve(true)),
}));

// expo-secure-store mock (P06): in-memory keychain, no native module in Jest.
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK',
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

// expo-image-picker mock (P06.2): tests override the returned asset.
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({
    granted: true,
    status: 'granted',
    canAskAgain: true,
    expires: 'never',
  })),
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [
      {
        uri: 'file://picked-photo.jpg',
        width: 1200,
        height: 800,
        fileSize: 240000,
        mimeType: 'image/jpeg',
      },
    ],
  })),
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos', All: 'All' },
}));

// expo-image-manipulator mock (P06.2): legacy API, no native rendering in Jest.
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({
    uri: uri === 'file://in.jpg' ? 'file://azib-avatar.jpg' : uri,
    width: 512,
    height: 512,
  })),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
}));

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
// This mock replaces:
//   - Animated.View/Text/ScrollView/Image  → RN components
//   - useSharedValue(v)                     → { value: v } (plain object)
//   - useAnimatedStyle(fn)                  → fn() (evaluated once)
//   - withTiming/withSpring/withRepeat/etc. → returns final value
// Result: no animations in Jest, but components render with final styles.
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
    g.onStart = self;
    g.onUpdate = self;
    g.onEnd = self;
    g.onBegin = self;
    g.onFinalize = self;
    g.onChange = self;
    g.enabled = self;
    g.minDistance = self;
    return g;
  };
  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: AnimatedText,
      ScrollView: AnimatedScrollView,
      Image: AnimatedImage,
      createAnimatedComponent: identity,
    },
    View: AnimatedView,
    Text: AnimatedText,
    ScrollView: AnimatedScrollView,
    Image: AnimatedImage,
    createAnimatedComponent: identity,
    useSharedValue: (v: unknown) => shared(v),
    useAnimatedStyle: (fn: () => object) => fn(),
    useAnimatedProps: (fn: () => object) => fn(),
    useDerivedValue: (fn: () => unknown) => shared(fn()),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: (fn: unknown) => fn,
    useAnimatedReaction: () => {},
    useAnimatedGestureHandler: () => ({}),
    withTiming: (v: unknown) => v,
    withSpring: (v: unknown) => v,
    withRepeat: (v: unknown) => v,
    withDelay: (_d: number, v: unknown) => v,
    withSequence: (...v: unknown[]) => v[v.length - 1],
    withDecay: (v: unknown) => v,
    cancelAnimation: () => {},
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    runOnUI: (fn: (...args: unknown[]) => unknown) => fn,
    interpolate: identity,
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Easing: {
      linear: identity,
      ease: identity,
      inOut: (v: unknown) => v,
      bezier: () => identity,
      out: (v: unknown) => v,
      in: (v: unknown) => v,
      elastic: () => identity,
      quad: identity,
      cubic: identity,
    },
    Gesture: {
      Pan: chainableGesture,
      Tap: chainableGesture,
      LongPress: chainableGesture,
      Pinch: chainableGesture,
      Rotation: chainableGesture,
    },
    GestureDetector: ({ children }: { children: unknown }) => children,
  };
});
