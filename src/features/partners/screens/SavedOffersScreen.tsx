import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { OfferCard } from '../components/OfferCard';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { useSavedOffers } from '../hooks/use-saved-offers';

export function SavedOffersScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const saved = useSavedOffers();

  return (
    <PartnerScaffold
      testID="saved-offers-screen"
      title={t('marketplace:saved.title')}
      subtitle={t('marketplace:saved.subtitle')}
      notConnectedRetry={saved.refetch}
    >
      {saved.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {saved.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={saved.refetch}
          testID="saved-offers-error"
        />
      ) : null}
      {!saved.isLoading && !saved.error && saved.rows.length === 0 ? (
        <EmptyState
          icon="heart"
          title={t('marketplace:saved.empty')}
          description={t('marketplace:saved.emptyDescription')}
          testID="saved-offers-empty"
        />
      ) : null}
      <View style={{ gap: theme.spacing[3] }}>
        {saved.rows.map((row) => (
          <OfferCard key={row.offer.id} row={row} />
        ))}
      </View>
      <Text variant="caption" color="secondary">
        {t('marketplace:saved.privateNote')}
      </Text>
    </PartnerScaffold>
  );
}
