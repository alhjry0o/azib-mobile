import type { Job } from '@/repositories/contracts/job';
import {
  DEFAULT_JOB_FILTERS,
  DEFAULT_JOB_LIMITS,
  JOB_CATEGORIES,
  JOB_CV_LIMITS,
  daysRemaining,
  filterJobs,
  hasActiveJobFilters,
  isAcceptingApplications,
  isJobExpired,
  isPastDeadline,
  jobExpiryFrom,
  jobVisibility,
  resolveJobLimits,
  toEmployerApplicantView,
  toPublicJobView,
} from '../index';
import type { JobApplication } from '@/repositories/contracts/job-application';

const NOW = new Date('2026-06-01T00:00:00.000Z');

function job(patch: Partial<Job> = {}): Job {
  return {
    id: 'j1',
    titleKey: 'jobs:customJob',
    status: 'open',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-01T00:00:00.000Z',
    dataOrigin: 'demo',
    title: 'Shop assistant',
    category: 'retail',
    governorateId: 'sanaa',
    workType: 'daily',
    schedule: 'part_time',
    salaryMin: 40000,
    salaryMax: 60000,
    publisherId: 'publisher-1',
    publisherName: 'Demo publisher',
    expiresAt: '2026-12-01T00:00:00.000Z',
    ...patch,
  };
}

describe('job expiry', () => {
  it('computes expiry and evaluates the boundary', () => {
    expect(jobExpiryFrom('2026-06-01T00:00:00.000Z', 30)).toBe('2026-07-01T00:00:00.000Z');
    expect(jobExpiryFrom('nope', 30)).toBeNull();
    expect(isJobExpired({ expiresAt: '2026-06-01T00:00:00.000Z' }, NOW)).toBe(true);
    expect(isJobExpired({ expiresAt: '2026-07-01T00:00:00.000Z' }, NOW)).toBe(false);
    expect(isJobExpired({ expiresAt: null }, NOW)).toBe(false);
  });

  it('separates visibility from the application deadline', () => {
    expect(jobVisibility(job(), NOW)).toBe('live');
    expect(jobVisibility(job({ status: 'closed' }), NOW)).toBe('closed');
    expect(jobVisibility(job({ status: 'draft' }), NOW)).toBe('not_published');
    expect(jobVisibility(job({ expiresAt: '2026-05-01T00:00:00.000Z' }), NOW)).toBe('expired');
    expect(isPastDeadline({ deadline: '2026-05-01T00:00:00.000Z' }, NOW)).toBe(true);
    expect(isAcceptingApplications(job({ deadline: '2026-05-01T00:00:00.000Z' }), NOW)).toBe(false);
    expect(isAcceptingApplications(job(), NOW)).toBe(true);
    expect(daysRemaining('2026-06-11T00:00:00.000Z', NOW)).toBe(10);
    expect(daysRemaining(null, NOW)).toBeNull();
  });
});

describe('job filters', () => {
  const rows = [
    job(),
    job({ id: 'j2', title: 'Warehouse helper', category: 'transport', governorateId: 'aden' }),
    job({ id: 'j3', status: 'draft', title: 'Draft role' }),
    job({ id: 'j4', status: 'closed', title: 'Closed role' }),
  ];

  it('shows only live jobs by default and never drafts', () => {
    expect(filterJobs(rows, DEFAULT_JOB_FILTERS, NOW).map((j) => j.id)).toEqual(['j1', 'j2']);
    const withClosed = filterJobs(rows, { ...DEFAULT_JOB_FILTERS, includeClosed: true }, NOW);
    expect(withClosed.map((j) => j.id)).toEqual(['j1', 'j2', 'j4']);
  });

  it('filters by category, region, work type, schedule and salary floor', () => {
    expect(
      filterJobs(rows, { ...DEFAULT_JOB_FILTERS, category: 'transport' }, NOW).map((j) => j.id),
    ).toEqual(['j2']);
    expect(
      filterJobs(rows, { ...DEFAULT_JOB_FILTERS, governorateId: 'aden' }, NOW).map((j) => j.id),
    ).toEqual(['j2']);
    expect(
      filterJobs(rows, { ...DEFAULT_JOB_FILTERS, workType: 'professional' }, NOW),
    ).toEqual([]);
    expect(
      filterJobs(rows, { ...DEFAULT_JOB_FILTERS, schedule: 'part_time' }, NOW).length,
    ).toBe(2);
    expect(
      filterJobs(rows, { ...DEFAULT_JOB_FILTERS, salaryFloor: 50000 }, NOW).length,
    ).toBe(2);
    expect(filterJobs(rows, { ...DEFAULT_JOB_FILTERS, salaryFloor: 90000 }, NOW)).toEqual([]);
  });

  it('matches free text with distinguishing fixtures and reports active filters', () => {
    expect(
      filterJobs(rows, { ...DEFAULT_JOB_FILTERS, text: 'warehouse' }, NOW).map((j) => j.id),
    ).toEqual(['j2']);
    expect(hasActiveJobFilters(DEFAULT_JOB_FILTERS)).toBe(false);
    expect(hasActiveJobFilters({ ...DEFAULT_JOB_FILTERS, text: 'x' })).toBe(true);
    expect(JOB_CATEGORIES.length).toBe(11);
  });
});

describe('job limits', () => {
  it('falls back to provisional defaults for invalid settings', () => {
    expect(resolveJobLimits(undefined)).toEqual(DEFAULT_JOB_LIMITS);
    expect(resolveJobLimits({ jobExpiryDays: 'month' })).toEqual(DEFAULT_JOB_LIMITS);
    expect(resolveJobLimits({ jobExpiryDays: 0 })).toEqual(DEFAULT_JOB_LIMITS);
    expect(resolveJobLimits({ jobMaxActiveApplications: 999 })).toEqual(DEFAULT_JOB_LIMITS);
  });

  it('accepts valid settings and keeps CV limits job-owned', () => {
    const limits = resolveJobLimits({ jobExpiryDays: 45, jobMaxActiveApplications: 8 });
    expect(limits.jobExpiryDays).toBe(45);
    expect(limits.maxActiveApplications).toBe(8);
    expect(JOB_CV_LIMITS.pdfMaxBytes).toBe(10 * 1024 * 1024);
    expect(JOB_CV_LIMITS.allowedMimeTypes).toContain('application/pdf');
  });
});

describe('job projections minimise data at the boundary', () => {
  it('never projects publisherId and never carries a verified flag', () => {
    const view = toPublicJobView(job());
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('publisher-1');
    expect(Object.keys(view)).not.toContain('publisherId');
    expect(Object.keys(view)).not.toContain('verified');
    expect(view.publisherName).toBe('Demo publisher');
    expect(view.salaryMax).toBe(60000);
  });

  it('gives the employer minimum data with no CV id and no applicant id', () => {
    const application: JobApplication = {
      id: 'a1',
      jobId: 'j1',
      applicantId: 'applicant-1',
      headline: 'Retail experience',
      message: 'I have two years of shop experience.',
      cvFileId: 'file-secret',
      status: 'submitted',
      submittedAt: '2026-06-01T00:00:00.000Z',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      dataOrigin: 'demo',
    };
    const view = toEmployerApplicantView(application);
    const serialized = JSON.stringify(view);
    expect(serialized).not.toContain('file-secret');
    expect(serialized).not.toContain('applicant-1');
    expect(view.hasCv).toBe(true);
    expect(Object.keys(view)).not.toContain('cvFileId');
  });
});
