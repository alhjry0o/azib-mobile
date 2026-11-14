import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';

export function ForbiddenView() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Screen testID="forbidden-view" style={styles.center}>
      <View
        style={[
          styles.iconCircle,
          {
            borderColor: theme.colors.state.danger,
            backgroundColor: 'rgba(255,92,122,0.16)',
          },
        ]}
      >
        <Icon name="shield" size={28} color={theme.colors.state.danger} />
      </View>
      <Text variant="h3" align="center">
        {t('common:shell.forbidden.title')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('common:shell.forbidden.description')}
      </Text>
      <Button
        variant="secondary"
        label={t('common:shell.placeholder.backHome')}
        onPress={() => router.replace(href(ROUTES.root))}
        testID="forbidden-back-home"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
