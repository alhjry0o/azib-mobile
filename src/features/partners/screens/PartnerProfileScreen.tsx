import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { OfferCard } from '../components/OfferCard';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { VerifiedCrown } from '../components/VerifiedCrown';
import { usePartnerProfile } from '../hooks/use-partner-profile';
import { categoryLabelKey } from '../lib/categories';

export function PartnerProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const partnerId = params.id ?? '';
  const profile = usePartnerProfile(partnerId);
  const data = profile.data;

  return (
    <PartnerScaffold
      testID="partner-profile-screen"
      title={t('marketplace:profile.title')}
      notConnectedRetry={profile.refetch}
    >
      {profile.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {profile.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={profile.refetch}
          testID="partner-profile-error"
        />
      ) : null}
      {!profile.isLoading && !profile.error && !data ? (
        <EmptyState
          icon="info"
          title={t('marketplace:profile.notFound')}
          description={t('marketplace:profile.notFoundDescription')}
          testID="partner-profile-missing"
        />
      ) : null}

      {data ? (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="partner-summary">
            <Text variant="h2">{data.partner.displayName}</Text>
            <VerifiedCrown verified={data.verified} testID="partner-profile-crown" />
            <Text variant="caption" color="secondary">
              {t(categoryLabelKey(data.partner.category))}
            </Text>
            {data.partner.description ? (
              <Text variant="body" color="secondary">
                {data.partner.description}
              </Text>
            ) : null}
            {data.partner.governorateId ? (
              <Text variant="caption" color="secondary">
                {t(`profile:locations.${data.partner.governorateId}`)}
              </Text>
            ) : null}
            {data.partner.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('marketplace:demo.partnerBadge')} />
            ) : null}
            {!data.verified ? (
              <Banner
                variant="warning"
                message={t('marketplace:profile.notVerifiedNote')}
                testID="partner-not-verified"
              />
            ) : null}
          </Card>

          <Button
            fullWidth
            variant="secondary"
            leftIcon="gift"
            label={t('marketplace:offers.title')}
            onPress={() => router.push(href(ROUTES.partners.offers(partnerId)))}
            testID="partner-open-offers"
          />

          <Text variant="h3">{t('marketplace:offers.title')}</Text>
          {data.offers.length === 0 ? (
            <EmptyState
              icon="gift"
              title={t('marketplace:offers.empty')}
              description={t('marketplace:offers.emptyDescription')}
              testID="partner-offers-empty"
            />
          ) : null}
          <View style={{ gap: theme.spacing[3] }}>
            {data.offers.map((row) => (
              <OfferCard key={row.offer.id} row={row} />
            ))}
          </View>
        </>
      ) : null}
    </PartnerScaffold>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 8 },
});

void styles;
