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
