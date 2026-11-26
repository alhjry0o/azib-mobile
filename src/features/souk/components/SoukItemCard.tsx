import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import { categoryLabelKey } from '../state/filters';
import type { PublicSoukItemView } from '../state/public-view';
import { ConditionBadge, DeliveryBadge, SoukItemStatusBadge } from './SoukBadges';

export interface SoukItemCardProps {
  readonly item: PublicSoukItemView;
}

/** Warm card built ONLY from the public projection — no donor, no estimate. */
export function SoukItemCard({ item }: SoukItemCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  return (
    <Card variant="crest" style={{ gap: theme.spacing[2] }} testID={`souk-card-${item.id}`}>
      <Text variant="h3" numberOfLines={2}>
        {item.title ?? t(item.titleKey)}
      </Text>
      <View
        style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] }]}
      >
        <ConditionBadge condition={item.condition} testID={`souk-condition-${item.id}`} />
        <DeliveryBadge method={item.deliveryMethod} />
        <SoukItemStatusBadge status={item.status} />
      </View>
      <Text variant="caption" color="secondary">
        {t(categoryLabelKey(item.category))}
      </Text>
      {item.governorateId ? (
        <Text variant="caption" color="secondary" testID={`souk-area-${item.id}`}>
          {t(`profile:locations.${item.governorateId}`)}
        </Text>
      ) : null}
      <Text variant="caption" color="tertiary">
        {t('marketplace:souk.browser.areaNote')}
      </Text>
      {item.dataOrigin === 'demo' ? (
        <Badge variant="demo" size="sm" label={t('marketplace:souk.demo.badge')} />
      ) : null}
      <Button
        variant="secondary"
        size="sm"
        label={t('marketplace:souk.browser.openItem')}
        onPress={() => router.push(href(ROUTES.souk.detail(item.id)))}
        testID={`souk-open-${item.id}`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexWrap: 'wrap' },
});
