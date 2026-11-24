// Demo values are ALWAYS labeled a placeholder — never presented as a real price.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Text } from '@/components/ui';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import type { DiscountType, Offer } from '@/repositories/contracts/offer';

export interface DiscountValueProps {
  readonly offer: Offer;
  readonly compact?: boolean;
  readonly testID?: string;
}

function labelKeyFor(type: DiscountType): string {
  return `marketplace:discount.types.${type}`;
}

export function DiscountValue({ offer, compact = false, testID }: DiscountValueProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const format = useHomeFormatters();

  const type: DiscountType = offer.discountType ?? 'percent';
  const value = offer.discountValue ?? offer.discountPercent;
  const isPlaceholder = offer.discountPlaceholder === true || offer.dataOrigin === 'demo';

  const display =
    type === 'percent'
      ? format.percent(value / 100)
      : type === 'fixed'
        ? format.number(value)
        : t(labelKeyFor(type));

  return (
    <View
      style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] }]}
      testID={testID}
    >
      <Text variant={compact ? 'h3' : 'h2'} color="gold">
        {display}
      </Text>
      <Text variant="caption" color="secondary">
        {t(labelKeyFor(type))}
      </Text>
      {isPlaceholder ? (
        <Badge
          variant="pending"
          size="sm"
          label={t('marketplace:discount.placeholder')}
          testID={testID ? `${testID}-placeholder` : undefined}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexWrap: 'wrap' },
});
