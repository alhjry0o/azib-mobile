import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection } from '@/hooks';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { categoryLabelKey } from '../lib/categories';
import type { PartnerRow } from '../hooks/use-partner-browser';
import { VerifiedCrown } from './VerifiedCrown';

export interface PartnerCardProps {
  readonly row: PartnerRow;
}

export function PartnerCard({ row }: PartnerCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const format = useHomeFormatters();
  const { partner } = row;

  return (
    <Card
      variant="crest"
      style={{ gap: theme.spacing[2] }}
      testID={`partner-card-${partner.id}`}
    >
      <View
        style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] }]}
      >
        <Text variant="h3" style={styles.grow} numberOfLines={2}>
          {partner.displayName}
        </Text>
        <VerifiedCrown verified={row.verified} testID={`partner-crown-${partner.id}`} />
      </View>
      <Text variant="caption" color="secondary">
        {t(categoryLabelKey(partner.category))}
      </Text>
      {partner.governorateId ? (
        <Text variant="caption" color="secondary">
          {t(`profile:locations.${partner.governorateId}`)}
        </Text>
      ) : null}
      <View
        style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] }]}
      >
        <Badge
          variant="neutral"
          size="sm"
          label={t('marketplace:browser.offerCount', { count: format.number(row.offerCount) })}
        />
        {partner.dataOrigin === 'demo' ? (
          <Badge variant="demo" size="sm" label={t('marketplace:demo.partnerBadge')} />
        ) : null}
      </View>
      <Button
        variant="secondary"
        size="sm"
        label={t('marketplace:browser.openPartner')}
        onPress={() => router.push(href(ROUTES.partners.profile(partner.id)))}
        testID={`partner-open-${partner.id}`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
  grow: { flex: 1 },
});
