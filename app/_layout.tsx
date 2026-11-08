import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// RTL support: allow RTL layout in the native layer.
// Actual per-locale forcing (forceRTL) is wired in P03 with the i18n system.
I18nManager.allowRTL(true);

export default function RootLayout() {
  return (
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
