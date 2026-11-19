// Verified offers only: an offer is shown when its partner is verified.
// Offers whose partnerId does not resolve are dropped (never shown as verified).
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection } from '@/hooks';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import { useTheme } from '@/theme';
import { SectionShell } from '../components/SectionShell';
import { useHomeFormatters } from '../hooks/use-home-formatters';
import { useHomeSection } from '../hooks/use-home-section';

const MAX_ITEMS = 5;

export interface VerifiedOffer {
  readonly id: string;
  readonly titleKey: string;
  readonly discountPercent: number;
  readonly partnerName: string;
  readonly dataOrigin: 'demo' | 'real';
}

export function OffersSection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const container = useProviderContainer();
  const format = useHomeFormatters();

  const section = useHomeSection<VerifiedOffer>({
    id: 'offers',
    fetch: async (): Promise<Result<readonly VerifiedOffer[]>> => {
      const offers = await container.repositories.offers.list({ limit: 50 });
      if (!offers.ok) return offers;
      const partners = await container.repositories.partners.list({ limit: 100 });
      if (!partners.ok) return partners;
      const verified = new Map(
        partners.value.items
          .filter((partner) => partner.status === 'verified')
          .map((partner) => [partner.id, partner.displayName]),
      );
      const rows: VerifiedOffer[] = [];
      for (const offer of offers.value.items) {
        if (offer.status !== 'active') continue;
        const partnerName = verified.get(offer.partnerId);
        if (!partnerName) continue;
        rows.push({
          id: offer.id,
          titleKey: offer.titleKey,
          discountPercent: offer.discountPercent,
          partnerName,
          dataOrigin: offer.dataOrigin,
        });
      }
      return { ok: true, value: rows.slice(0, MAX_ITEMS) };
    },
  });

  return (
    <SectionShell
      id="offers"
      title={t('home:sections.offers.title')}
      subtitle={t('home:sections.offers.subtitle')}
      status={section.status}
      emptyIcon="gift"
      emptyTitle={t('home:sections.offers.empty')}
      emptyDescription={t('home:sections.offers.emptyDescription')}
      actionLabel={t('home:sections.offers.viewAll')}
      onAction={() => router.navigate(href(ROUTES.tabs.partners))}
      onRetry={section.refetch}
    >
      <View style={{ gap: theme.spacing[2] }}>
        {section.data.map((offer) => (
          <Card
            key={offer.id}
            variant="pressable"
            accessibilityLabel={t(offer.titleKey)}
            onPress={() => router.navigate(href(ROUTES.tabs.partners))}
            testID={`offers-card-${offer.id}`}
            style={{ gap: theme.spacing[2] }}
          >
            <View
              style={[
                styles.row,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Text variant="bodyStrong" style={styles.title} numberOfLines={2}>
                {t(offer.titleKey)}
              </Text>
              <Badge
                variant="success"
                label={format.percent(offer.discountPercent / 100)}
                testID={`offers-discount-${offer.id}`}
              />
            </View>
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {offer.partnerName}
            </Text>
            <View
              style={[
                styles.row,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Badge variant="verified" size="sm" label={t('home:sections.offers.verified')} />
              {offer.dataOrigin === 'demo' ? (
                <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
              ) : null}
            </View>
          </Card>
        ))}
      </View>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
  title: { flex: 1 },
});
