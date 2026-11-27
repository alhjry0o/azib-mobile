import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Banner, Button, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import { ApplicationStatusBadge } from '../components/JobBadges';
import { JobScaffold } from '../components/JobScaffold';
import { useMyApplications } from '../hooks/use-job-application';
import { jobErrorKey } from '../state/error-keys';
import { isActiveApplicationStatus, toApplicationWorkflowStatus } from '../state/application-machine';

export function MyApplicationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const mine = useMyApplications();

  return (
    <JobScaffold
      testID="my-applications-screen"
      title={t('jobs:applications.title')}
      subtitle={t('jobs:applications.subtitle')}
      notConnectedRetry={mine.refetch}
    >
      {mine.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {mine.error ? (
        <ErrorState
          title={t('jobs:browser.errorTitle')}
          description={t('jobs:browser.errorDescription')}
          onRetry={mine.refetch}
          testID="my-applications-error"
        />
      ) : null}
      {mine.actionError ? (
        <Banner
          variant="error"
          message={t(jobErrorKey(mine.actionError))}
          testID="my-applications-action-error"
        />
      ) : null}
      {!mine.isLoading && !mine.error && mine.rows.length === 0 ? (
        <EmptyState
          icon="userCheck"
          title={t('jobs:applications.empty')}
          description={t('jobs:applications.emptyDescription')}
          action={{
            label: t('jobs:browser.title'),
            onPress: () => router.replace(href(ROUTES.jobs.root)),
          }}
          testID="my-applications-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {mine.rows.map((row) => {
          const status = toApplicationWorkflowStatus(row.status);
          return (
            <Card key={row.id} style={{ gap: theme.spacing[2] }} testID={`my-application-${row.id}`}>
              <ApplicationStatusBadge
                status={row.status}
                testID={`my-application-status-${row.id}`}
              />
              <ApplicationTimeline application={row} testID={`my-application-timeline-${row.id}`} />
              {row.reasonKey ? (
                <Text variant="caption" color="secondary">
                  {t(row.reasonKey)}
                </Text>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                label={t('jobs:browser.openJob')}
                onPress={() => router.push(href(ROUTES.jobs.detail(row.jobId)))}
                testID={`my-application-open-${row.id}`}
              />
              {isActiveApplicationStatus(status) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  loading={mine.busy}
                  label={t('jobs:applications.withdraw')}
                  onPress={() => {
                    void mine.withdraw(row.id);
                  }}
                  testID={`my-application-withdraw-${row.id}`}
                />
              ) : null}
            </Card>
          );
        })}
      </View>
    </JobScaffold>
  );
}
