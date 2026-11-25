import { useTranslation } from 'react-i18next';
import { Badge, type BadgeVariant } from '@/components/ui';
import type { OfferStatus } from '@/repositories/contracts/offer';

const VARIANTS: Readonly<Record<OfferStatus, BadgeVariant>> = {
  draft: 'neutral',
  in_review: 'pending',
  approved: 'info',
  active: 'success',
  expired: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
};

export interface OfferStatusBadgeProps {
  readonly status: OfferStatus;
  readonly testID?: string;
}

export function OfferStatusBadge({ status, testID }: OfferStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={VARIANTS[status]}
      size="sm"
      label={t(`marketplace:offerStatus.${status}`)}
      testID={testID}
    />
  );
}
