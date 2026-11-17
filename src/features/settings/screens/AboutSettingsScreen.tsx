import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

export function AboutSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '0.1.0';

  return (
    <SettingsScaffold testID="settings-about-screen" title={t('profile:settings.rows.about')}>
      <Card style={{ gap: theme.spacing[2] }}>
        <Text variant="h2" color="gold">
          {t('common:appName')}
        </Text>
        <Text variant="body" color="secondary" testID="about-version">
          {t('profile:settings.about.version', { version })}
        </Text>
        <Text variant="body" color="secondary">
          {t('common:phaseLabel')}
        </Text>
      </Card>
      <Card style={{ gap: theme.spacing[2] }}>
        <Text variant="bodyStrong">{t('profile:settings.about.principlesTitle')}</Text>
        <Text variant="body" color="secondary">
          {t('profile:settings.about.principles')}
        </Text>
      </Card>
    </SettingsScaffold>
  );
}
