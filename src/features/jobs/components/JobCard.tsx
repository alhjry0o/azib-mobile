import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import { jobCategoryLabelKey } from '../state/filters';
import type { PublicJobView } from '../state/public-view';
import { JobStatusBadge, ScheduleBadge, WorkTypeBadge } from './JobBadges';
import { SalaryNote } from './SalaryNote';

export interface JobCardProps {
  readonly job: PublicJobView;
}

/** Built ONLY from the public projection — no publisherId, no verified flag. */
export function JobCard({ job }: JobCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  return (
    <Card variant="crest" style={{ gap: theme.spacing[2] }} testID={`job-card-${job.id}`}>
      <Text variant="h3" numberOfLines={2}>
        {job.title ?? t(job.titleKey)}
      </Text>
      <View
        style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] }]}
      >
        <WorkTypeBadge workType={job.workType} />
        <ScheduleBadge schedule={job.schedule} />
        <JobStatusBadge status={job.status} />
      </View>
      <Text variant="caption" color="secondary">
        {t(jobCategoryLabelKey(job.category ?? 'other'))}
      </Text>
      {job.governorateId ? (
        <Text variant="caption" color="secondary" testID={`job-area-${job.id}`}>
          {t(`profile:locations.${job.governorateId}`)}
        </Text>
      ) : null}
      <SalaryNote
        salaryMin={job.salaryMin}
        salaryMax={job.salaryMax}
        testID={`job-salary-${job.id}`}
      />
      <Text variant="caption" color="secondary">
        {job.publisherName ?? t('jobs:detail.unknownPublisher')}
      </Text>
      <Badge variant="pending" size="sm" label={t('jobs:detail.unverifiedPublisher')} />
      {job.dataOrigin === 'demo' ? (
        <Badge variant="demo" size="sm" label={t('jobs:demo.badge')} />
      ) : null}
      <Button
        variant="secondary"
        size="sm"
        label={t('jobs:browser.openJob')}
        onPress={() => router.push(href(ROUTES.jobs.detail(job.id)))}
        testID={`job-open-${job.id}`}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexWrap: 'wrap' },
});
