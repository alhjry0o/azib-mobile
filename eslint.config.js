// Flat config (ESLint 9). `expo lint` uses this file directly.
// If you upgrade eslint-config-expo and its export shape changes,
// run `npx expo lint` once to auto-generate, then merge ignoring rules from here.

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
    rules: {
      // Keep template defaults. Add project-wide overrides in P03+.
    },
  },
];
