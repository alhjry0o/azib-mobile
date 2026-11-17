import { useTranslation } from 'react-i18next';
import { Card, SegmentedControl, Text } from '@/components/ui';
import { useDirection } from '@/hooks';
import { useLanguageSwitch } from '@/features/shell/use-language-switch';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

export function LanguageSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { direction } = useDirection();
  const { language, switchLanguage } = useLanguageSwitch();

  return (
    <SettingsScaffold
      testID="settings-language-screen"
      title={t('profile:settings.rows.language')}
    >
      <Card style={{ gap: theme.spacing[3] }}>
        <SegmentedControl
          segments={[
            { value: 'ar' as const, label: t('common:language.arabic') },
            { value: 'en' as const, label: t('common:language.english') },
          ]}
          value={language}
          onChange={(value) => {
            void switchLanguage(value);
          }}
          testID="settings-language-control"
        />
        <Text variant="caption" color="secondary" testID="settings-language-direction">
          {t('common:shell.dev.language.description', { direction })}
        </Text>
        <Text variant="caption" color="secondary">
          {t('common:shell.dev.language.note')}
        </Text>
      </Card>
    </SettingsScaffold>
  );
}
