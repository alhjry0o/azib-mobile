import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { JobCard } from '../components/JobCard';
import { JobScaffold } from '../components/JobScaffold';
import { useSavedJobs } from '../hooks/use-saved-jobs';

export function SavedJobsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const saved = useSavedJobs();

  return (
    <JobScaffold
      testID="saved-jobs-screen"
      title={t('jobs:saved.title')}
      subtitle={t('jobs:saved.subtitle')}
      notConnectedRetry={saved.refetch}
    >
      {saved.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {saved.error ? (
        <ErrorState
          title={t('jobs:browser.errorTitle')}
          description={t('jobs:browser.errorDescription')}
          onRetry={saved.refetch}
          testID="saved-jobs-error"
        />
      ) : null}
      {!saved.isLoading && !saved.error && saved.rows.length === 0 ? (
        <EmptyState
          icon="heart"
          title={t('jobs:saved.empty')}
          description={t('jobs:saved.emptyDescription')}
          testID="saved-jobs-empty"
        />
      ) : null}
      <View style={{ gap: theme.spacing[3] }}>
        {saved.rows.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </View>
      <Text variant="caption" color="secondary">
        {t('jobs:saved.privateNote')}
      </Text>
    </JobScaffold>
  );
}
