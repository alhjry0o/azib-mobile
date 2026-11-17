import { useTranslation } from 'react-i18next';
import { Banner, Card, SegmentedControl, Text } from '@/components/ui';
import { useSettingsStore } from '@/stores';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

type AppearanceChoice = 'dark' | 'light' | 'system';

export function AppearanceSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const appearance = useSettingsStore((s) => s.appearance);
  const setAppearance = useSettingsStore((s) => s.setAppearance);

  return (
    <SettingsScaffold
      testID="settings-appearance-screen"
      title={t('profile:settings.rows.appearance')}
    >
      <Card style={{ gap: theme.spacing[3] }}>
        <SegmentedControl<AppearanceChoice>
          segments={[
            { value: 'dark', label: t('profile:settings.appearance.dark') },
            { value: 'light', label: t('profile:settings.appearance.light'), disabled: true },
            { value: 'system', label: t('profile:settings.appearance.system'), disabled: true },
          ]}
          value={appearance}
          onChange={() => setAppearance('dark')}
          testID="settings-appearance-control"
        />
        <Text variant="caption" color="secondary">
          {t('profile:settings.appearance.note')}
        </Text>
      </Card>
      <Banner
        variant="info"
        message={t('profile:settings.appearance.unavailable')}
        testID="appearance-unavailable"
      />
    </SettingsScaffold>
  );
      }
