import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  Chip,
  EmptyState,
  ErrorState,
  NotConnectedState,
  Screen,
  Search,
  Select,
  Skeleton,
  Switch,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { useDirection } from '@/hooks';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { PartnerCard } from '../components/PartnerCard';
import { PARTNER_CATEGORIES } from '../lib/categories';
import { hasActivePartnerFilters } from '../lib/filters';
import { usePartnerBrowser } from '../hooks/use-partner-browser';

export function PartnerBrowserScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const container = useProviderContainer();
  const browser = usePartnerBrowser();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="partners-screen" style={styles.center}>
        <NotConnectedState
          title={t('marketplace:browser.notConnected')}
          description={t('marketplace:browser.notConnectedDescription')}
          onRetry={browser.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="partners-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[12] }}
    >
      <Text variant="h1" style={styles.title}>
        {t('marketplace:browser.title')}
      </Text>
      <Text variant="body" color="secondary">
        {t('marketplace:browser.subtitle')}
      </Text>
      <Banner
        variant="info"
        message={t('marketplace:browser.crownNote')}
        testID="partners-crown-note"
      />

      <Button
        variant="secondary"
        fullWidth
        leftIcon="heart"
        label={t('marketplace:saved.title')}
        onPress={() => router.push(href(ROUTES.partners.saved))}
        testID="partners-open-saved"
      />

      <Search
        testID="partners-search"
        placeholder={t('marketplace:browser.searchPlaceholder')}
        value={browser.filters.text}
        onChangeText={(text) => browser.setFilters({ ...browser.filters, text })}
        onClear={() => browser.setFilters({ ...browser.filters, text: '' })}
      />
      <Select
        testID="partners-region"
        label={t('marketplace:browser.region')}
        value={browser.filters.governorateId}
        options={governorates}
        onChange={(value) => browser.setFilters({ ...browser.filters, governorateId: value })}
      />
      <Switch
        value={browser.filters.verifiedOnly}
        onValueChange={(value) => browser.setFilters({ ...browser.filters, verifiedOnly: value })}
        label={t('marketplace:browser.verifiedOnly')}
        labelFirst
        testID="partners-verified-only"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing[2] }}
        testID="partners-categories"
      >
        <Chip
          label={t('marketplace:browser.allCategories')}
          selected={browser.filters.category === null}
          onPress={() => browser.setFilters({ ...browser.filters, category: null })}
          testID="category-all"
        />
        {PARTNER_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={t(`marketplace:categories.${category}`)}
            selected={browser.filters.category === category}
            onPress={() => browser.setFilters({ ...browser.filters, category })}
            testID={`category-${category}`}
          />
        ))}
      </ScrollView>

      {hasActivePartnerFilters(browser.filters) ? (
        <Button
          variant="ghost"
          size="sm"
          label={t('marketplace:browser.clearFilters')}
          onPress={browser.clearFilters}
          testID="partners-clear-filters"
        />
      ) : null}

      {browser.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {browser.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={browser.refetch}
          testID="partners-error"
        />
      ) : null}
      {!browser.isLoading && !browser.error && browser.rows.length === 0 ? (
        <EmptyState
          icon="users"
          title={t('marketplace:browser.empty')}
          description={t('marketplace:browser.emptyDescription')}
          testID="partners-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {browser.rows.map((row) => (
          <PartnerCard key={row.partner.id} row={row} />
        ))}
      </View>
      <Text variant="caption" color="secondary" align="center">
        {t('marketplace:demo.notice')}
      </Text>
      <View style={[styles.hidden, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  title: { marginTop: 16 },
  hidden: { height: 0 },
});
