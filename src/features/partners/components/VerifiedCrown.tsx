// The crown appears ONLY when a live verification record exists (D-3).
// `verified` is computed in the query layer from PartnerVerification, never
// from Partner.status.
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui';

export interface VerifiedCrownProps {
  readonly verified: boolean;
  readonly testID?: string;
}

export function VerifiedCrown({ verified, testID }: VerifiedCrownProps) {
  const { t } = useTranslation();
  if (!verified) return null;
  return (
    <Badge
      variant="verified"
      size="sm"
      label={t('marketplace:crown.verified')}
      testID={testID}
    />
  );
}
