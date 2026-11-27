import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
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
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import { JobStatusBadge, ScheduleBadge, WorkTypeBadge } from '../components/JobBadges';
import { JobScaffold } from '../components/JobScaffold';
import { SalaryNote } from '../components/SalaryNote';
import { useJobDetail } from '../hooks/use-job-detail';
import { jobErrorKey } from '../state/error-keys';
import { jobCategoryLabelKey } from '../state/filters';

export function JobDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const format = useHomeFormatters();
  const params = useLocalSearchParams<{ id?: string }>();
  const jobId = params.id ?? '';
  const detail = useJobDetail(jobId);
  const data = detail.data;

  return (
    <JobScaffold
      testID="job-detail-screen"
      title={t('jobs:detail.title')}
      notConnectedRetry={detail.refetch}
    >
      {detail.isLoading ? <Skeleton variant="rect" height={160} /> : null}
      {detail.error ? (
        <ErrorState
          title={t('jobs:browser.errorTitle')}
          description={t('jobs:browser.errorDescription')}
          onRetry={detail.refetch}
          testID="job-detail-error"
        />
      ) : null}
      {!detail.isLoading && !detail.error && !data ? (
        <EmptyState
          icon="info"
          title={t('jobs:detail.notFound')}
          description={t('jobs:detail.notFoundDescription')}
          testID="job-detail-missing"
        />
      ) : null}
      {detail.actionError ? (
        <Banner
          variant="error"
          message={t(jobErrorKey(detail.actionError))}
          testID="job-detail-action-error"
        />
      ) : null}

      {data ? (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[3] }} testID="job-detail-card">
            <Text variant="h2">{data.job.title ?? t(data.job.titleKey)}</Text>
            <View style={{ gap: theme.spacing[2] }}>
              <WorkTypeBadge workType={data.job.workType} />
              <ScheduleBadge schedule={data.job.schedule} />
              <JobStatusBadge status={data.job.status} testID="job-detail-status" />
            </View>
            <Text variant="caption" color="secondary">
              {t(jobCategoryLabelKey(data.job.category ?? 'other'))}
            </Text>
            {data.job.governorateId ? (
              <Text variant="caption" color="secondary" testID="job-detail-area">
                {t(`profile:locations.${data.job.governorateId}`)}
              </Text>
            ) : null}
            <SalaryNote
              salaryMin={data.job.salaryMin}
              salaryMax={data.job.salaryMax}
              testID="job-detail-salary"
            />
            {data.job.description ? (
              <Text variant="body" color="secondary" testID="job-detail-description">
                {data.job.description}
              </Text>
            ) : null}
            <Text variant="caption" color="secondary">
              {data.job.publisherName ?? t('jobs:detail.unknownPublisher')}
            </Text>
            <Badge
              variant="pending"
              size="sm"
              label={t('jobs:detail.unverifiedPublisher')}
              testID="job-detail-unverified-publisher"
            />
            {data.job.deadline ? (
              <Text variant="caption" color="secondary">
                {t('jobs:detail.deadline', { date: format.date(data.job.deadline) })}
              </Text>
            ) : null}
            {data.daysLeft !== null ? (
              <Text variant="caption" color="secondary" testID="job-detail-days-left">
                {t('jobs:detail.expiresIn', { days: format.number(data.daysLeft) })}
              </Text>
            ) : null}
          </Card>

          {data.job.requirements.length > 0 ? (
            <Card style={{ gap: theme.spacing[2] }} testID="job-detail-requirements">
              <Text variant="h3">{t('jobs:detail.requirements')}</Text>
              {data.job.requirements.map((requirement) => (
                <Text key={requirement} variant="body" color="secondary">
                  {requirement}
                </Text>
              ))}
            </Card>
          ) : null}

          <Card style={{ gap: theme.spacing[2] }} testID="job-detail-how">
            <Text variant="h3">{t('jobs:detail.how')}</Text>
            <Text variant="body" color="secondary">
              {t(`jobs:applicationMethod.${data.job.applicationMethod}`)}
            </Text>
            {data.job.applicationInstructions ? (
              <Text variant="caption" color="secondary">
                {data.job.applicationInstructions}
              </Text>
            ) : null}
            <Text variant="caption" color="tertiary">
              {t('jobs:detail.noPaymentNote')}
            </Text>
          </Card>

          {data.visibility !== 'live' ? (
            <Banner
              variant="warning"
              message={t(`jobs:detail.visibility.${data.visibility}`)}
              testID="job-detail-visibility"
            />
          ) : null}

          {data.myApplication ? (
            <Card style={{ gap: theme.spacing[2] }} testID="job-detail-my-application">
              <ApplicationTimeline
                application={data.myApplication}
                testID="job-detail-timeline"
              />
              <Button
                variant="ghost"
                size="sm"
                label={t('jobs:applications.title')}
                onPress={() => router.push(href(ROUTES.jobs.applications))}
                testID="job-detail-open-applications"
              />
            </Card>
          ) : null}

          {data.canApply ? (
            <Button
              fullWidth
              leftIcon="userCheck"
              label={t('jobs:apply.title')}
              onPress={() => router.push(href(ROUTES.jobs.apply(jobId)))}
              testID="job-detail-apply"
            />
          ) : null}

          {data.isOwner ? (
            <Button
              fullWidth
              variant="secondary"
              leftIcon="users"
              label={t('jobs:applicants.title')}
              onPress={() => router.push(href(ROUTES.jobs.applicants(jobId)))}
              testID="job-detail-applicants"
            />
          ) : null}

          <Button
            fullWidth
            variant={data.saved ? 'secondary' : 'ghost'}
            leftIcon="heart"
            loading={detail.busy}
            label={data.saved ? t('jobs:detail.unsave') : t('jobs:detail.save')}
            onPress={() => {
              void detail.toggleSave();
            }}
            testID="job-detail-save"
          />
          <Button
            fullWidth
            variant="ghost"
            leftIcon="alertTriangle"
            label={t('jobs:reportScreen.title')}
            onPress={() => router.push(href(ROUTES.jobs.report(jobId)))}
            testID="job-detail-report"
          />
        </>
      ) : null}
    </JobScaffold>
  );
}
