import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
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
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/theme';
import { ApplicationStatusBadge } from '../components/JobBadges';
import { JobScaffold } from '../components/JobScaffold';
import { useJobApplicants } from '../hooks/use-job-applicants';
import { toApplicationWorkflowStatus } from '../state/application-machine';
import { jobErrorKey } from '../state/error-keys';

export function JobApplicantsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const jobId = params.id ?? '';
  const applicants = useJobApplicants(jobId);
  const [cvReference, setCvReference] = useState<string | null>(null);

  const data = applicants.data;

  const readCv = async (applicationId: string): Promise<void> => {
    const result = await applicants.readCv(applicationId);
    if (result.ok) setCvReference(result.value);
  };

  return (
    <JobScaffold
      testID="job-applicants-screen"
      title={t('jobs:applicants.title')}
      subtitle={t('jobs:applicants.subtitle')}
      backTo={ROUTES.jobs.detail(jobId)}
      notConnectedRetry={applicants.refetch}
    >
      {applicants.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {applicants.error ? (
        <ErrorState
          title={t('jobs:browser.errorTitle')}
          description={t('jobs:browser.errorDescription')}
          onRetry={applicants.refetch}
          testID="job-applicants-error"
        />
      ) : null}
      {applicants.actionError ? (
        <Banner
          variant="error"
          message={t(jobErrorKey(applicants.actionError))}
          testID="job-applicants-action-error"
        />
      ) : null}

      {data && !data.isOwner ? (
        <EmptyState
          icon="shield"
          title={t('jobs:applicants.notOwner')}
          description={t('jobs:applicants.notOwnerDescription')}
          testID="job-applicants-forbidden"
        />
      ) : null}

      {data?.isOwner ? (
        <>
          <Banner
            variant="info"
            message={t('jobs:applicants.minimumNote')}
            testID="job-applicants-minimum-note"
          />
          {data.rows.length === 0 ? (
            <EmptyState
              icon="users"
              title={t('jobs:applicants.empty')}
              description={t('jobs:applicants.emptyDescription')}
              testID="job-applicants-empty"
            />
          ) : null}
          <View style={{ gap: theme.spacing[3] }}>
            {data.rows.map((row) => {
              const status = toApplicationWorkflowStatus(row.status);
              return (
                <Card key={row.id} style={{ gap: theme.spacing[2] }} testID={`applicant-${row.id}`}>
                  <Text variant="bodyStrong">{row.headline}</Text>
                  <ApplicationStatusBadge
                    status={row.status}
                    testID={`applicant-status-${row.id}`}
                  />
                  <Text variant="body" color="secondary">
                    {row.message}
                  </Text>
                  {row.hasCv ? (
                    <View style={{ gap: theme.spacing[2] }}>
                      <Badge variant="info" size="sm" label={t('jobs:cv.attached')} />
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={applicants.busy}
                        label={t('jobs:applicants.readCv')}
                        onPress={() => {
                          void readCv(row.id);
                        }}
                        testID={`applicant-cv-${row.id}`}
                      />
                    </View>
                  ) : (
                    <Text variant="caption" color="tertiary">{t('jobs:cv.none')}</Text>
                  )}
                  {status === 'submitted' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={applicants.busy}
                      label={t('jobs:applicants.markViewed')}
                      onPress={() => {
                        void applicants.markViewed(row.id);
                      }}
                      testID={`applicant-viewed-${row.id}`}
                    />
                  ) : null}
                  {status === 'submitted' || status === 'viewed' ? (
                    <Button
                      size="sm"
                      loading={applicants.busy}
                      label={t('jobs:applicants.shortlist')}
                      onPress={() => {
                        void applicants.shortlist(row.id);
                      }}
                      testID={`applicant-shortlist-${row.id}`}
                    />
                  ) : null}
                  {status === 'shortlisted' ? (
                    <Button
                      size="sm"
                      variant="gold"
                      loading={applicants.busy}
                      label={t('jobs:applicants.hire')}
                      onPress={() => {
                        void applicants.hire(row.id);
                      }}
                      testID={`applicant-hire-${row.id}`}
                    />
                  ) : null}
                  {status !== 'hired' && status !== 'rejected' && status !== 'withdrawn' ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={applicants.busy}
                      label={t('jobs:applicants.reject')}
                      onPress={() => {
                        void applicants.reject(row.id, 'jobs:reasons.notQualified');
                      }}
                      testID={`applicant-reject-${row.id}`}
                    />
                  ) : null}
                </Card>
              );
            })}
          </View>
          {cvReference ? (
            <Card style={{ gap: theme.spacing[2] }} testID="job-applicants-cv-reference">
              <Text variant="bodyStrong">{t('jobs:cv.referenceTitle')}</Text>
              <Text variant="caption" color="secondary">
                {cvReference}
              </Text>
              <Text variant="caption" color="tertiary">
                {t('jobs:cv.renderNote')}
              </Text>
            </Card>
          ) : null}
        </>
      ) : null}
    </JobScaffold>
  );
}
