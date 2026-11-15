import { Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  AnimatedSplash,
  AppErrorBoundary,
  BottomSheetHost,
  DialogHost,
  ShellBanners,
} from '@/components/shell';
import { ToastProvider } from '@/components/ui';
import { DeepLinkGuard, LanguageBootstrap, appQueryClient } from '@/features/shell';
import { i18n } from '@/i18n';
import { ProviderContainerProvider } from '@/providers';
import { ThemeProvider, palette } from '@/theme';

I18nManager.allowRTL(true);
// Keep the native splash visible until fonts are ready, then hand off
// to the animated brand splash (skippable, Reduce Motion aware).
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={styles.root} />;
  }

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={appQueryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider>
            <SafeAreaProvider>
              <ProviderContainerProvider>
                <ToastProvider>
                  <View style={styles.root}>
                    <StatusBar style="light" />
                    <LanguageBootstrap />
                    <DeepLinkGuard />
                    <ShellBanners />
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        contentStyle: styles.content,
                      }}
                    />
                    <DialogHost />
                    <BottomSheetHost />
                    {!splashDone ? (
                      <AnimatedSplash onFinish={() => setSplashDone(true)} />
                    ) : null}
                  </View>
                </ToastProvider>
              </ProviderContainerProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.black[900],
  },
  content: {
    backgroundColor: palette.black[900],
  },
});
