import { useTranslation } from 'react-i18next';
import { Badge, type BadgeVariant } from '@/components/ui';
import type { SoukCondition, SoukDeliveryMethod, SoukStatus } from '@/repositories/contracts/souk';
import type { SoukRequestStatus } from '@/repositories/contracts/souk-request';

const CONDITION_VARIANTS: Readonly<Record<SoukCondition, BadgeVariant>> = {
  new: 'success',
  good: 'info',
  acceptable: 'neutral',
};

const ITEM_VARIANTS: Readonly<Record<SoukStatus, BadgeVariant>> = {
  available: 'success',
  reserved: 'pending',
  claimed: 'verified',
  draft: 'neutral',
  pending_review: 'pending',
  handed_over: 'verified',
  withdrawn: 'neutral',
  expired: 'warning',
  rejected: 'danger',
};

const REQUEST_VARIANTS: Readonly<Record<SoukRequestStatus, BadgeVariant>> = {
  pending: 'pending',
  accepted: 'success',
  rejected: 'danger',
  cancelled: 'neutral',
  handed_over: 'verified',
};

export interface ConditionBadgeProps {
  readonly condition: SoukCondition;
  readonly testID?: string;
}

export function ConditionBadge({ condition, testID }: ConditionBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={CONDITION_VARIANTS[condition]}
      size="sm"
      label={t(`marketplace:souk.condition.${condition}`)}
      testID={testID}
    />
  );
}

export interface DeliveryBadgeProps {
  readonly method: SoukDeliveryMethod;
  readonly testID?: string;
}

export function DeliveryBadge({ method, testID }: DeliveryBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant="accent"
      size="sm"
      label={t(`marketplace:souk.delivery.${method}`)}
      testID={testID}
    />
  );
}

export interface SoukItemStatusBadgeProps {
  readonly status: SoukStatus;
  readonly testID?: string;
}

export function SoukItemStatusBadge({ status, testID }: SoukItemStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={ITEM_VARIANTS[status]}
      size="sm"
      label={t(`marketplace:souk.itemStatus.${status}`)}
      testID={testID}
    />
  );
}

export interface SoukRequestStatusBadgeProps {
  readonly status: SoukRequestStatus;
  readonly testID?: string;
}

export function SoukRequestStatusBadge({ status, testID }: SoukRequestStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={REQUEST_VARIANTS[status]}
      size="sm"
      label={t(`marketplace:souk.requestStatus.${status}`)}
      testID={testID}
    />
  );
}
