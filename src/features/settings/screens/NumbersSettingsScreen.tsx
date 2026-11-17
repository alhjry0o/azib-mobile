import { useTranslation } from 'react-i18next';
import { Card, SegmentedControl, Text } from '@/components/ui';
import { useSettingsStore, type NumberSystem } from '@/stores';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

const SAMPLE = 12345;

export function NumbersSettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const numberSystem = useSettingsStore((s) => s.numberSystem);
  const setNumberSystem = useSettingsStore((s) => s.setNumberSystem);

  const preview = new Intl.NumberFormat('ar-YE', { numberingSystem: numberSystem }).format(SAMPLE);

  return (
    <SettingsScaffold
      testID="settings-numbers-screen"
      title={t('profile:settings.rows.numbers')}
    >
      <Card style={{ gap: theme.spacing[3] }}>
        <SegmentedControl<NumberSystem>
          segments={[
            { value: 'latn', label: t('profile:settings.numbers.latn') },
            { value: 'arab', label: t('profile:settings.numbers.arab') },
          ]}
          value={numberSystem}
          onChange={setNumberSystem}
          testID="settings-numbers-control"
        />
        <Text variant="h2" align="center" testID="settings-numbers-preview">
          {preview}
        </Text>
        <Text variant="caption" color="secondary">
          {t('profile:settings.numbers.note')}
        </Text>
      </Card>
    </SettingsScaffold>
  );
      }
