// Flat config (ESLint 9). `expo lint` uses this file directly.
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...(Array.isArray(expoConfig) ? expoConfig : [expoConfig]),
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'coverage/**',
      'expo-env.d.ts',
      'assets/**',
    ],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    rules: {
      // Keep template defaults. Add project-wide overrides in P03+.
    },
  },
];
