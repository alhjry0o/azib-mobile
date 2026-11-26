import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import {
  Banner,
  Button,
  Chip,
  ErrorState, 
  NotConnectedState,
  Screen,
  Search,
  Select,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { GiftEmptyState } from '../components/GiftEmptyState';
import { SoukItemCard } from '../components/SoukItemCard';
import { useSoukBrowser } from '../hooks/use-souk-browser';
import { SOUK_CATEGORIES, hasActiveSoukFilters } from '../state/filters';

export function SoukBrowserScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const browser = useSoukBrowser();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="souk-screen" style={{ justifyContent: 'center' }}>
        <NotConnectedState
          title={t('marketplace:souk.browser.notConnected')}
          description={t('marketplace:souk.browser.notConnectedDescription')}
          onRetry={browser.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="souk-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[12] }}
    >
      <Text variant="h1" style={{ marginTop: theme.spacing[4] }}>
        {t('marketplace:souk.browser.title')}
      </Text>
      <Text variant="body" color="secondary">
        {t('marketplace:souk.browser.subtitle')}
      </Text>
      <Banner
        variant="info"
        message={t('marketplace:souk.browser.noPriceNote')}
        testID="souk-no-price-note"
      />

      <Button
        fullWidth
        leftIcon="plus"
        label={t('marketplace:souk.composer.title')}
        onPress={() => router.push(href(ROUTES.souk.new))}
        testID="souk-open-composer"
      />
      <Button
        variant="secondary"
        fullWidth
        leftIcon="gift"
        label={t('marketplace:souk.mine.title')}
        onPress={() => router.push(href(ROUTES.souk.mine))}
        testID="souk-open-mine"
      />
      <Button
        variant="ghost"
        fullWidth
        leftIcon="heart"
        label={t('marketplace:souk.requests.title')}
        onPress={() => router.push(href(ROUTES.souk.requests))}
        testID="souk-open-requests"
      />

      <Search
        testID="souk-search"
        placeholder={t('marketplace:souk.browser.searchPlaceholder')}
        value={browser.filters.text}
        onChangeText={(text) => browser.setFilters({ ...browser.filters, text })}
        onClear={() => browser.setFilters({ ...browser.filters, text: '' })}
      />
      <Select
        testID="souk-region"
        label={t('marketplace:souk.browser.region')}
        value={browser.filters.governorateId}
        options={governorates}
        onChange={(value) => browser.setFilters({ ...browser.filters, governorateId: value })}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing[2] }}
        testID="souk-categories"
      >
        <Chip
          label={t('marketplace:souk.browser.allCategories')}
          selected={browser.filters.category === null}
          onPress={() => browser.setFilters({ ...browser.filters, category: null })}
          testID="souk-category-all"
        />
        {SOUK_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={t(`marketplace:souk.categories.${category}`)}
            selected={browser.filters.category === category}
            onPress={() => browser.setFilters({ ...browser.filters, category })}
            testID={`souk-category-${category}`}
          />
        ))}
      </ScrollView>

      {hasActiveSoukFilters(browser.filters) ? (
        <Button
          variant="ghost"
          size="sm"
          label={t('marketplace:souk.browser.clearFilters')}
          onPress={browser.clearFilters}
          testID="souk-clear-filters"
        />
      ) : null}

      {browser.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {browser.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={browser.refetch}
          testID="souk-error"
        />
      ) : null}
      {!browser.isLoading && !browser.error && browser.rows.length === 0 ? (
        <GiftEmptyState
          title={t('marketplace:souk.browser.empty')}
          description={t('marketplace:souk.browser.emptyDescription')}
          actionLabel={t('marketplace:souk.composer.title')}
          onAction={() => router.push(href(ROUTES.souk.new))}
          testID="souk-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {browser.rows.map((item) => (
          <SoukItemCard key={item.id} item={item} />
        ))}
      </View>
      <Text variant="caption" color="secondary" align="center">
        {t('marketplace:souk.demo.notice')}
      </Text>
    </Screen>
  );
}
