import { useTranslation } from 'react-i18next';
import { Badge, type BadgeVariant } from '@/components/ui';
import type { JobSchedule, JobStatus, JobWorkType } from '@/repositories/contracts/job';
import type { JobApplicationStatus } from '@/repositories/contracts/job-application';

const JOB_VARIANTS: Readonly<Record<JobStatus, BadgeVariant>> = {
  draft: 'neutral',
  pending_review: 'pending',
  open: 'success',
  closed: 'neutral',
  expired: 'warning',
  rejected: 'danger',
};

const APPLICATION_VARIANTS: Readonly<Record<JobApplicationStatus, BadgeVariant>> = {
  submitted: 'pending',
  viewed: 'info',
  shortlisted: 'accent',
  rejected: 'danger',
  hired: 'verified',
  withdrawn: 'neutral',
};

export interface JobStatusBadgeProps {
  readonly status: JobStatus;
  readonly testID?: string;
}

export function JobStatusBadge({ status, testID }: JobStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={JOB_VARIANTS[status]}
      size="sm"
      label={t(`jobs:jobStatus.${status}`)}
      testID={testID}
    />
  );
}

export interface ApplicationStatusBadgeProps {
  readonly status: JobApplicationStatus;
  readonly testID?: string;
}

export function ApplicationStatusBadge({ status, testID }: ApplicationStatusBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant={APPLICATION_VARIANTS[status]}
      size="sm"
      label={t(`jobs:applicationStatus.${status}`)}
      testID={testID}
    />
  );
}

export interface WorkTypeBadgeProps {
  readonly workType: JobWorkType;
  readonly testID?: string;
}

export function WorkTypeBadge({ workType, testID }: WorkTypeBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant="accent"
      size="sm"
      label={t(`jobs:workType.${workType}`)}
      testID={testID}
    />
  );
}

export interface ScheduleBadgeProps {
  readonly schedule: JobSchedule;
  readonly testID?: string;
}

export function ScheduleBadge({ schedule, testID }: ScheduleBadgeProps) {
  const { t } = useTranslation();
  return (
    <Badge
      variant="neutral"
      size="sm"
      label={t(`jobs:schedule.${schedule}`)}
      testID={testID}
    />
  );
}
