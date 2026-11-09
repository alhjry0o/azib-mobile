import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, StyleSheet, View } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { i18n } from '@/i18n';

// Enable RTL at the native layer. Per-language forcing is handled by P05 Developer Settings.
I18nManager.allowRTL(true);

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
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
