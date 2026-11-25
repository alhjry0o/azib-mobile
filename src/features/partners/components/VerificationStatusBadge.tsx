import { useTranslation } from 'react-i18next';
import { Badge, type BadgeVariant } from '@/components/ui';
import type { PartnerStatus } from '@/repositories/contracts/partner';

const VARIANTS: Readonly<Record<PartnerStatus, BadgeVariant>> = {
  draft: 'neutral',
  pending_verification: 'pending',
  verified: 'verified',
  rejected: 'danger',
  suspended: 'warning',
  expired: 'warning',
};

export interface VerificationStatusBadgeProps {
  readonly status: PartnerStatus;
  readonly testID?: string;
}

export function VerificationStatusBadge({ status, testID }: VerificationStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={VARIANTS[status]}
      size="sm"
      label={t(`marketplace:partnerStatus.${status}`)}
      testID={testID}
    />
  );
}
