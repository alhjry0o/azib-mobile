import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  NotConnectedState,
  Screen,
  SegmentedControl,
  Select,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useDirection } from '@/hooks';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { hasActiveFilters } from '../engine/discovery';
import type { DiscoverySizeFilter, DiscoveryStatusFilter } from '../engine/discovery';
import { toGroupStatus } from '../state/group-machine';
import { toPublicGroupView } from '../state/roles';
import { useWeddingDiscovery } from '../hooks/use-wedding-discovery';

export function WeddingDiscoveryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const container = useProviderContainer();
  const discovery = useWeddingDiscovery();
  const format = useHomeFormatters();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );
  const districts = useMemo(
    () =>
      discovery.filters.governorateId
        ? childrenOf(discovery.filters.governorateId).map((d) => ({
            value: d.id,
            label: t(d.nameKey),
          }))
        : [],
    [discovery.filters.governorateId, t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="weddings-screen" style={styles.center}>
        <NotConnectedState
          title={t('weddings:discovery.notConnected')}
          description={t('weddings:discovery.notConnectedDescription')}
          onRetry={discovery.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="weddings-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[12] }}
    >
      <Text variant="h1" style={styles.title}>
        {t('weddings:discovery.title')}
      </Text>
      <Text variant="body" color="secondary">
        {t('weddings:discovery.subtitle')}
      </Text>
      <Banner variant="info" message={t('weddings:discovery.publicNote')} testID="weddings-public-note" />
      <Button
        fullWidth
        leftIcon="plus"
        label={t('weddings:discovery.create')}
        onPress={() => router.push(href(ROUTES.weddings.new))}
        testID="weddings-create"
      />

      <Card style={{ gap: theme.spacing[3] }} testID="weddings-filters">
        <Text variant="h3">{t('weddings:discovery.filters.title')}</Text>
        <Select
          testID="filter-governorate"
          label={t('weddings:discovery.filters.governorate')}
          value={discovery.filters.governorateId}
          options={governorates}
          onChange={(value) =>
            discovery.setFilters({ ...discovery.filters, governorateId: value, districtId: null })
          }
        />
        <Select
          testID="filter-district"
          label={t('weddings:discovery.filters.district')}
          value={discovery.filters.districtId}
          options={districts}
          disabled={districts.length === 0}
          onChange={(value) => discovery.setFilters({ ...discovery.filters, districtId: value })}
        />
        <SegmentedControl<DiscoveryStatusFilter>
          segments={[
            { value: 'any', label: t('weddings:discovery.status.any') },
            { value: 'open', label: t('weddings:discovery.status.open') },
            { value: 'planning', label: t('weddings:discovery.status.planning') },
            { value: 'agreed', label: t('weddings:discovery.status.agreed') },
          ]}
          value={discovery.filters.status}
          onChange={(value) => discovery.setFilters({ ...discovery.filters, status: value })}
          size="sm"
          testID="filter-status"
        />
        <SegmentedControl<DiscoverySizeFilter>
          segments={[
            { value: 'any', label: t('weddings:discovery.size.any') },
            { value: 'small', label: t('weddings:discovery.size.small') },
            { value: 'medium', label: t('weddings:discovery.size.medium') },
            { value: 'large', label: t('weddings:discovery.size.large') },
          ]}
          value={discovery.filters.size}
          onChange={(value) => discovery.setFilters({ ...discovery.filters, size: value })}
          size="sm"
          testID="filter-size"
        />
        {hasActiveFilters(discovery.filters) ? (
          <Button
            variant="ghost"
            size="sm"
            label={t('weddings:discovery.filters.clear')}
            onPress={discovery.clearFilters}
            testID="filter-clear"
          />
        ) : null}
      </Card>

      {discovery.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {discovery.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          onRetry={discovery.refetch}
          testID="weddings-error"
        />
      ) : null}
      {!discovery.isLoading && !discovery.error && discovery.rows.length === 0 ? (
        <EmptyState
          icon="heart"
          title={t('weddings:discovery.empty')}
          description={t('weddings:discovery.emptyDescription')}
          testID="weddings-empty"
        />
      ) : null}

      {discovery.rows.map((row) => {
        const view = toPublicGroupView({
          titleKey: row.wedding.titleKey,
          governorateId: row.wedding.governorateId,
          districtId: row.wedding.districtId,
          memberCount: row.memberCount,
          scheduledDate: row.wedding.scheduledDate,
        });
        const status = toGroupStatus(row.wedding.status);
        return (
          <Card
            key={row.wedding.id}
            variant="crest"
            style={{ gap: theme.spacing[2] }}
            testID={`wedding-card-${row.wedding.id}`}
          >
            <Text variant="h3">{row.wedding.title ?? t(view.titleKey)}</Text>
            <View
              style={[
                styles.row,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Badge variant="pending" size="sm" label={t(`weddings:discovery.status.${status}`)} />
              <Badge
                variant="neutral"
                size="sm"
                label={t('weddings:discovery.members', { count: format.number(view.memberCount) })}
              />
            </View>
            <Text variant="caption" color="secondary">
              {view.governorateId ? t(`profile:locations.${view.governorateId}`) : ''}
            </Text>
            <Text variant="caption" color="secondary" testID={`wedding-month-${row.wedding.id}`}>
              {t('weddings:discovery.approximateDate', { month: view.approximateDate })}
            </Text>
            <Button
              variant="secondary"
              size="sm"
              label={t('weddings:discovery.openGroup')}
              onPress={() => router.push(href(ROUTES.weddings.detail(row.wedding.id)))}
              testID={`wedding-open-${row.wedding.id}`}
            />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  title: { marginTop: 16 },
  row: { alignItems: 'center' },
});
