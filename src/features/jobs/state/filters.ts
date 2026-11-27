import type { Job, JobSchedule, JobWorkType } from '@/repositories/contracts/job';
import { jobVisibility } from './expiry';

export const JOB_CATEGORIES = [
  'retail',
  'hospitality',
  'construction',
  'transport',
  'education',
  'health',
  'it',
  'admin',
  'crafts',
  'agriculture',
  'other',
] as const;
export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const JOB_WORK_TYPES: readonly JobWorkType[] = [
  'daily',
  'professional',
  'freelance',
  'internship',
];
export const JOB_SCHEDULES: readonly JobSchedule[] = [
  'full_time',
  'part_time',
  'shifts',
  'flexible',
];

export function isJobCategory(value: string): value is JobCategory {
  return (JOB_CATEGORIES as readonly string[]).includes(value);
}

export function jobCategoryLabelKey(category: string): string {
  return isJobCategory(category) ? `jobs:categories.${category}` : 'jobs:categories.other';
}

export interface JobFilters {
  readonly text: string;
  readonly category: string | null;
  readonly governorateId: string | null;
  readonly workType: JobWorkType | null;
  readonly schedule: JobSchedule | null;
  /** Minimum salary the seeker needs; matched against the declared range. */
  readonly salaryFloor: number | null;
  readonly includeClosed: boolean;
}

export const DEFAULT_JOB_FILTERS: JobFilters = Object.freeze({
  text: '',
  category: null,
  governorateId: null,
  workType: null,
  schedule: null,
  salaryFloor: null,
  includeClosed: false,
});

function matches(haystack: readonly (string | null | undefined)[], needle: string): boolean {
  const query = needle.trim().toLowerCase();
  if (query.length === 0) return true;
  return haystack.some((value) => (value ?? '').toLowerCase().includes(query));
}

export function filterJobs(
  jobs: readonly Job[],
  filters: JobFilters,
  now: Date,
): readonly Job[] {
  return jobs.filter((job) => {
    const visibility = jobVisibility(job, now);
    if (!filters.includeClosed && visibility !== 'live') return false;
    if (filters.includeClosed && visibility === 'not_published') return false;
    if (filters.category && job.category !== filters.category) return false;
    if (filters.governorateId && job.governorateId !== filters.governorateId) return false;
    if (filters.workType && (job.workType ?? 'professional') !== filters.workType) return false;
    if (filters.schedule && (job.schedule ?? 'full_time') !== filters.schedule) return false;
    if (filters.salaryFloor !== null) {
      const ceiling = job.salaryMax ?? job.salaryMin ?? null;
      if (ceiling === null || ceiling < filters.salaryFloor) return false;
    }
    return matches([job.title, job.titleKey, job.description, job.publisherName], filters.text);
  });
}

export function hasActiveJobFilters(filters: JobFilters): boolean {
  return (
    filters.text.trim().length > 0 ||
    filters.category !== null ||
    filters.governorateId !== null ||
    filters.workType !== null ||
    filters.schedule !== null ||
    filters.salaryFloor !== null ||
    filters.includeClosed
  );
}
