import { Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, StyleSheet, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/i18n';
import { ProviderContainerProvider } from '@/providers';
import { ThemeProvider } from '@/theme';

I18nManager.allowRTL(true);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });

  // If a font fails to load, we still render (fallback to system) to avoid a blank app.
  if (!fontsLoaded && !fontError) {
    return <View style={styles.root} />;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ProviderContainerProvider>
          <SafeAreaProvider>
            <View style={styles.root}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: styles.content,
                }}
              />
            </View>
          </SafeAreaProvider>
        </ProviderContainerProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09080F',
  },
  content: {
    backgroundColor: '#09080F',
  },
});
