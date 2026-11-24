import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { OfferCard } from '../components/OfferCard';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { usePartnerProfile } from '../hooks/use-partner-profile';

export function OfferListScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const partnerId = params.id ?? '';
  const profile = usePartnerProfile(partnerId);
  const rows = profile.data?.offers ?? [];

  return (
    <PartnerScaffold
      testID="offer-list-screen"
      title={t('marketplace:offers.title')}
      subtitle={t('marketplace:offers.subtitle')}
      notConnectedRetry={profile.refetch}
    >
      {profile.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {profile.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={profile.refetch}
          testID="offer-list-error"
        />
      ) : null}
      {!profile.isLoading && !profile.error && rows.length === 0 ? (
        <EmptyState
          icon="gift"
          title={t('marketplace:offers.empty')}
          description={t('marketplace:offers.emptyDescription')}
          testID="offer-list-empty"
        />
      ) : null}
      <View style={{ gap: theme.spacing[3] }}>
        {rows.map((row) => (
          <OfferCard key={row.offer.id} row={row} />
        ))}
      </View>
      <Text variant="caption" color="secondary">
        {t('marketplace:demo.notice')}
      </Text>
    </PartnerScaffold>
  );
}
