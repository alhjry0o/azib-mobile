import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import type { OfferVisibility } from '../state/expiry';

export interface ValidityCountdownProps {
  readonly visibility: OfferVisibility;
  readonly daysLeft: number | null;
  readonly testID?: string;
}

export function ValidityCountdown({ visibility, daysLeft, testID }: ValidityCountdownProps) {
  const { t } = useTranslation();
  const format = useHomeFormatters();

  if (visibility === 'expired') {
    return (
      <Badge
        variant="danger"
        size="sm"
        label={t('marketplace:validity.expired')}
        testID={testID}
      />
    );
  }
  if (visibility === 'scheduled') {
    return (
      <Badge
        variant="info"
        size="sm"
        label={t('marketplace:validity.scheduled')}
        testID={testID}
      />
    );
  }
  if (visibility === 'not_published') {
    return (
      <Badge
        variant="neutral"
        size="sm"
        label={t('marketplace:validity.notPublished')}
        testID={testID}
      />
    );
  }
  return (
    <Badge
      variant="success"
      size="sm"
      label={
        daysLeft === null
          ? t('marketplace:validity.openEnded')
          : t('marketplace:validity.daysLeft', { days: format.number(daysLeft) })
      }
      testID={testID}
    />
  );
}
