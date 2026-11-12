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
