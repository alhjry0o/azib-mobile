import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card, Icon, ListItem, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

const QUESTIONS = ['what', 'privacy', 'assistance'] as const;

export function HelpSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SettingsScaffold testID="settings-help-screen" title={t('profile:settings.rows.help')}>
      {QUESTIONS.map((key) => (
        <Card key={key} style={{ gap: theme.spacing[2] }} testID={`help-${key}`}>
          <Text variant="bodyStrong">{t(`profile:settings.help.${key}.q`)}</Text>
          <Text variant="body" color="secondary">
            {t(`profile:settings.help.${key}.a`)}
          </Text>
        </Card>
      ))}
      <ListItem
        variant="card"
        title={t('profile:settings.rows.about')}
        leading={<Icon name="info" size={20} />}
        onPress={() => router.push(href(ROUTES.settings.about))}
        testID="help-open-about"
      />
    </SettingsScaffold>
  );
}
