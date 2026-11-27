import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
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
  Text,
  TextInput,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { JobCard } from '../components/JobCard';
import { useJobBrowser } from '../hooks/use-job-browser';
import {
  JOB_CATEGORIES,
  JOB_SCHEDULES,
  JOB_WORK_TYPES,
  hasActiveJobFilters,
} from '../state/filters';

export function JobBrowserScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const browser = useJobBrowser();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="jobs-screen" style={{ justifyContent: 'center' }}>
        <NotConnectedState
          title={t('jobs:browser.notConnected')}
          description={t('jobs:browser.notConnectedDescription')}
          onRetry={browser.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="jobs-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[12] }}
    >
      <Text variant="h1" style={{ marginTop: theme.spacing[4] }}>
        {t('jobs:browser.title')}
      </Text>
      <Text variant="body" color="secondary">
        {t('jobs:browser.subtitle')}
      </Text>
      <Banner
        variant="info"
        message={t('jobs:browser.salaryNote')}
        testID="jobs-salary-note"
      />

      <Button
        fullWidth
        leftIcon="plus"
        label={t('jobs:composer.title')}
        onPress={() => router.push(href(ROUTES.jobs.new))}
        testID="jobs-open-composer"
      />
      <Button
        variant="secondary"
        fullWidth
        leftIcon="userCheck"
        label={t('jobs:applications.title')}
        onPress={() => router.push(href(ROUTES.jobs.applications))}
        testID="jobs-open-applications"
      />
      <Button
        variant="ghost"
        fullWidth
        leftIcon="heart"
        label={t('jobs:saved.title')}
        onPress={() => router.push(href(ROUTES.jobs.saved))}
        testID="jobs-open-saved"
      />

      <Search
        testID="jobs-search"
        placeholder={t('jobs:browser.searchPlaceholder')}
        value={browser.filters.text}
        onChangeText={(text) => browser.setFilters({ ...browser.filters, text })}
        onClear={() => browser.setFilters({ ...browser.filters, text: '' })}
      />
      <Select
        testID="jobs-region"
        label={t('jobs:browser.region')}
        value={browser.filters.governorateId}
        options={governorates}
        onChange={(value) => browser.setFilters({ ...browser.filters, governorateId: value })}
      />

      <Text variant="captionStrong" color="secondary">
        {t('jobs:browser.category')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing[2] }}
        testID="jobs-categories"
      >
        <Chip
          label={t('jobs:browser.all')}
          selected={browser.filters.category === null}
          onPress={() => browser.setFilters({ ...browser.filters, category: null })}
          testID="jobs-category-all"
        />
        {JOB_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={t(`jobs:categories.${category}`)}
            selected={browser.filters.category === category}
            onPress={() => browser.setFilters({ ...browser.filters, category })}
            testID={`jobs-category-${category}`}
          />
        ))}
      </ScrollView>

      <Text variant="captionStrong" color="secondary">
        {t('jobs:browser.workType')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing[2] }}
        testID="jobs-work-types"
      >
        <Chip
          label={t('jobs:browser.all')}
          selected={browser.filters.workType === null}
          onPress={() => browser.setFilters({ ...browser.filters, workType: null })}
          testID="jobs-work-type-all"
        />
        {JOB_WORK_TYPES.map((workType) => (
          <Chip
            key={workType}
            label={t(`jobs:workType.${workType}`)}
            selected={browser.filters.workType === workType}
            onPress={() => browser.setFilters({ ...browser.filters, workType })}
            testID={`jobs-work-type-${workType}`}
          />
        ))}
      </ScrollView>

      <Text variant="captionStrong" color="secondary">
        {t('jobs:browser.schedule')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing[2] }}
        testID="jobs-schedules"
      >
        <Chip
          label={t('jobs:browser.all')}
          selected={browser.filters.schedule === null}
          onPress={() => browser.setFilters({ ...browser.filters, schedule: null })}
          testID="jobs-schedule-all"
        />
        {JOB_SCHEDULES.map((schedule) => (
          <Chip
            key={schedule}
            label={t(`jobs:schedule.${schedule}`)}
            selected={browser.filters.schedule === schedule}
            onPress={() => browser.setFilters({ ...browser.filters, schedule })}
            testID={`jobs-schedule-${schedule}`}
          />
        ))}
      </ScrollView>

      <TextInput
        testID="jobs-salary-floor"
        label={t('jobs:browser.salaryFloor')}
        helpText={t('jobs:browser.salaryFloorHelp')}
        keyboardType="number-pad"
        value={browser.filters.salaryFloor === null ? '' : String(browser.filters.salaryFloor)}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 9);
          browser.setFilters({
            ...browser.filters,
            salaryFloor: digits.length === 0 ? null : Number.parseInt(digits, 10),
          });
        }}
      />

      {hasActiveJobFilters(browser.filters) ? (
        <Button
          variant="ghost"
          size="sm"
          label={t('jobs:browser.clearFilters')}
          onPress={browser.clearFilters}
          testID="jobs-clear-filters"
        />
      ) : null}

      {browser.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {browser.error ? (
        <ErrorState
          title={t('jobs:browser.errorTitle')}
          description={t('jobs:browser.errorDescription')}
          onRetry={browser.refetch}
          testID="jobs-error"
        />
      ) : null}
      {!browser.isLoading && !browser.error && browser.rows.length === 0 ? (
        <EmptyState
          icon="users"
          title={t('jobs:browser.empty')}
          description={t('jobs:browser.emptyDescription')}
          action={{
            label: t('jobs:composer.title'),
            onPress: () => router.push(href(ROUTES.jobs.new)),
          }}
          testID="jobs-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {browser.rows.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </View>
      <Text variant="caption" color="secondary" align="center">
        {t('jobs:demo.notice')}
      </Text>
    </Screen>
  );
}
