import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import type { OfferView } from '../hooks/use-partner-profile';
import { DiscountValue } from './DiscountValue';
import { ValidityCountdown } from './ValidityCountdown';

export interface OfferCardProps {
  readonly row: OfferView;
}

export function OfferCard({ row }: OfferCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { offer } = row;

  return (
    <Card style={{ gap: theme.spacing[2] }} testID={`offer-card-${offer.id}`}>
      <Text variant="bodyStrong" numberOfLines={2}>
        {offer.title ?? t(offer.titleKey)}
      </Text>
      <DiscountValue offer={offer} compact testID={`offer-discount-${offer.id}`} />
      <View
        style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] }]}
      >
        <ValidityCountdown
          visibility={row.visibility}
          daysLeft={row.daysLeft}
          testID={`offer-validity-${offer.id}`}
        />
        <Badge
          variant="neutral"
          size="sm"
          label={t(`marketplace:audience.${offer.audience ?? 'beneficiaries'}`)}
        />
      </View>
      <Button
        variant="secondary"
        size="sm"
        label={t('marketplace:offers.openOffer')}
        onPress={() => router.push(href(ROUTES.partners.offer(offer.id)))}
        testID={`offer-open-${offer.id}`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexWrap: 'wrap' },
});
