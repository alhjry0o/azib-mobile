import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { t } from '@/lib/i18n';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <Text style={styles.title} accessibilityRole="header">
        {t('common.appName')}
      </Text>
      <Text style={styles.subtitle}>{t('common.phaseLabel')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09080F',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    color: '#F0CA68',
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 2,
  },
  subtitle: {
    color: '#9B5CFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.85,
  },
});
