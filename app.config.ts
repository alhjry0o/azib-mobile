import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config: _config }: ConfigContext): ExpoConfig => ({
  name: 'AZIB',
  slug: 'azib-mobile',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'azib',
  userInterfaceStyle: 'dark',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.azib.mobile',
  },
  android: {
    package: 'app.azib.mobile',
    allowBackup: false,
    supportsRTL: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: '#09080F',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
