import { useTranslation } from 'react-i18next';
import { Banner, Card, NotConnectedState, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { FinanceScaffold } from '../components/FinanceScaffold';

const REQUIREMENT_KEYS = ['licensed', 'agreement', 'keys', 'webhook', 'serverVerification'] as const;

export function LicensedProviderRequirementsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <FinanceScaffold
      testID="provider-requirements-screen"
      title={t('assistance:finance.requirements.title')}
      subtitle={t('assistance:finance.requirements.subtitle')}
    >
      <NotConnectedState
        title={t('assistance:finance.requirements.title')}
        description={t('assistance:finance.requirements.intro')}
        testID="provider-requirements-state"
      />
      {REQUIREMENT_KEYS.map((key) => (
        <Card
          key={key}
          style={{ gap: theme.spacing[2] }}
          testID={`provider-requirement-${key}`}
        >
          <Text variant="bodyStrong">{t(`assistance:finance.requirements.items.${key}`)}</Text>
        </Card>
      ))}
      <Banner
        variant="warning"
        message={t('assistance:finance.requirements.note')}
        testID="provider-requirements-note"
      />
    </FinanceScaffold>
  );
}
