// Certainty is conveyed by icon + text + colour together (HRD P09 §7).
// An intent is NEVER described as received money.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';
import type { DonationStatus } from '@/repositories/contracts/donation';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

export type CertaintyLevel =
  | 'intent'
  | 'providerPending'
  | 'providerConfirmed'
  | 'verified'
  | 'declined'
  | 'cancelled';

export function certaintyLevelOf(status: DonationStatus): CertaintyLevel {
  switch (status) {
    case 'verified':
      return 'verified';
    case 'provider_confirmed':
    case 'confirmed':
      return 'providerConfirmed';
    case 'provider_pending':
    case 'pending':
      return 'providerPending';
    case 'declined':
      return 'declined';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'intent';
  }
}

export interface CertaintyBadgeProps {
  readonly status: DonationStatus;
  readonly testID?: string;
}

export function CertaintyBadge({ status, testID }: CertaintyBadgeProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const level = certaintyLevelOf(status);

  const spec: { readonly icon: IconName; readonly color: string } =
    level === 'verified'
      ? { icon: 'checkCircle', color: theme.colors.state.success }
      : level === 'providerConfirmed'
        ? { icon: 'checkCircle', color: theme.colors.state.info }
        : level === 'providerPending'
          ? { icon: 'clock', color: theme.colors.state.info }
          : level === 'declined'
            ? { icon: 'xCircle', color: theme.colors.state.danger }
            : level === 'cancelled'
              ? { icon: 'x', color: theme.colors.text.secondary }
              : { icon: 'alertTriangle', color: theme.colors.gold.text };

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
        {t(`assistance:finance.certainty.${level}`)}
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
