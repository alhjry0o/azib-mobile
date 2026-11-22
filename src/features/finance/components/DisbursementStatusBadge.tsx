// Disbursement certainty by icon + text + colour together (HRD P09 §7).
// 'paid_recorded' is NEVER described as beneficiary-confirmed.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';
import type { DisbursementStatus } from '@/repositories/contracts/disbursement';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

export type DisbursementCertainty =
  | 'proposed'
  | 'approved'
  | 'paidRecorded'
  | 'beneficiaryConfirmed'
  | 'disputed'
  | 'rejected';

export const DISBURSEMENT_CERTAINTIES: readonly DisbursementCertainty[] = [
  'proposed',
  'approved',
  'paidRecorded',
  'beneficiaryConfirmed',
  'disputed',
  'rejected',
];

export function disbursementCertaintyOf(status: DisbursementStatus): DisbursementCertainty {
  switch (status) {
    case 'confirmed_by_beneficiary':
      return 'beneficiaryConfirmed';
    case 'paid_recorded':
    case 'confirmed':
      return 'paidRecorded';
    case 'approved':
      return 'approved';
    case 'disputed':
      return 'disputed';
    case 'rejected':
      return 'rejected';
    default:
      return 'proposed';
  }
}

export interface DisbursementStatusBadgeProps {
  readonly status: DisbursementStatus;
  readonly testID?: string;
}

export function DisbursementStatusBadge({ status, testID }: DisbursementStatusBadgeProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const certainty = disbursementCertaintyOf(status);

  const spec: { readonly icon: IconName; readonly color: string } =
    certainty === 'beneficiaryConfirmed'
      ? { icon: 'checkCircle', color: theme.colors.state.success }
      : certainty === 'paidRecorded'
        ? { icon: 'checkCircle', color: theme.colors.state.info }
        : certainty === 'approved'
          ? { icon: 'check', color: theme.colors.state.info }
          : certainty === 'disputed'
            ? { icon: 'alertTriangle', color: theme.colors.state.danger }
            : certainty === 'rejected'
              ? { icon: 'xCircle', color: theme.colors.state.danger }
              : { icon: 'clock', color: theme.colors.gold.text };

  return (
    <View
      style={[
        styles.row,
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          gap: theme.spacing[2],
          borderColor: spec.color,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.bg.raised,
        },
      ]}
      testID={testID}
      accessibilityRole="text"
    >
      <Icon name={spec.icon} size={14} color={spec.color} />
      <Text variant="captionStrong" color={spec.color}>
        {t(`assistance:finance.disbursements.status.${certainty}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
