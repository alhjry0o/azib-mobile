import { useTranslation } from 'react-i18next';
import { Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface SafeMeetingNoteProps {
  readonly testID?: string;
}

const GUIDELINE_KEYS = ['publicPlace', 'daylight', 'companion', 'noPayment', 'report'] as const;

export function SafeMeetingNote({ testID }: SafeMeetingNoteProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Card style={{ gap: theme.spacing[2] }} testID={testID}>
      <Text variant="h3">{t('marketplace:souk.coordination.safeTitle')}</Text>
      {GUIDELINE_KEYS.map((key) => (
        <Text key={key} variant="caption" color="secondary">
          {t(`marketplace:souk.coordination.safe.${key}`)}
        </Text>
      ))}
    </Card>
  );
}
