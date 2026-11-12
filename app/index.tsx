import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bg.canvas,
          paddingTop: insets.top + theme.spacing[6],
          paddingBottom: insets.bottom + theme.spacing[6],
          paddingHorizontal: theme.spacing[6],
        },
      ]}
    >
      <Text
        style={[styles.title, theme.typography.display, { color: theme.colors.text.gold }]}
        accessibilityRole="header"
      >
        {t('appName')}
      </Text>
      <Text
        style={[styles.subtitle, theme.typography.caption, { color: theme.colors.text.accent }]}
      >
        {t('phaseLabel')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.85,
  },
});
