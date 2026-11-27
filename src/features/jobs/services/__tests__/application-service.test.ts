import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockJobRepository } from '@/repositories/mock/job';
import { createMockJobApplicationRepository } from '@/repositories/mock/job-application';
import { createMockJobEngagementRepository } from '@/repositories/mock/job-engagement';
import { createMockStorageProvider } from '@/providers/mock/storage';
import {
  applyToJob,
  hireApplication,
  markApplicationViewed,
  rejectApplication,
  shortlistApplication,
  withdrawApplication,
} from '../application-service';
import { readApplicantCvFileId } from '../cv-service';
import { reportJob, resolveJobReport, saveJob } from '../engagement-service';
import { createJobDraft, publishJob } from '../job-service';
import { DEFAULT_JOB_LIMITS, resolveJobLimits } from '../../state/limits';

function setup() {
  return {
    jobs: createMockJobRepository(),
    jobApplications: createMockJobApplicationRepository(),
    engagement: createMockJobEngagementRepository(),
    audit: createMockAuditRepository(),
  };
}

const jobInput = {
  publisherId: 'publisher-1',
  publisherName: 'Demo publisher',
  title: 'Shop assistant',
  category: 'retail',
  description: 'A demo retail role with clearly fabricated details for testing.',
  governorateId: 'sanaa',
  districtId: null,
  workType: 'daily' as const,
  schedule: 'part_time' as const,
  salaryMin: null,
  salaryMax: null,
  requirements: [],
  applicationMethod: 'in_app' as const,
  applicationInstructions: null,
  deadline: null,
  publisherTermsAccepted: true,
};

async function openJob(deps: ReturnType<typeof setup>, title = 'Shop assistant') {
  const now = new Date();
  const created = await createJobDraft(
    { jobs: deps.jobs, audit: deps.audit },
    { ...jobInput, title },
    DEFAULT_JOB_LIMITS,
    now,
  );
  if (!created.ok) throw new Error('setup failed');
  await publishJob(
    { jobs: deps.jobs, audit: deps.audit },
    created.value.id,
    'publisher-1',
    false,
    DEFAULT_JOB_LIMITS,
    now,
  );
  return created.value.id;
}

describe('application service', () => {
  it('applies, then the concerned employer moves the timeline', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const now = new Date();
    const applied = await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      DEFAULT_JOB_LIMITS,
      now,
    );
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;

    const stranger = await markApplicationViewed(
      deps,
      applied.value.id,
      'someone-else',
      'member',
      now,
    );
    expect(stranger.ok).toBe(false);

    await markApplicationViewed(deps, applied.value.id, 'publisher-1', 'member', now);
    await shortlistApplication(deps, applied.value.id, 'publisher-1', 'member', now);
    const hired = await hireApplication(deps, applied.value.id, 'publisher-1', 'member', now);
    expect(hired.ok).toBe(true);
    if (hired.ok) {
      expect(hired.value.status).toBe('hired');
      expect(hired.value.viewedAt).toBeTruthy();
      expect(hired.value.shortlistedAt).toBeTruthy();
      expect(hired.value.hiredAt).toBeTruthy();
    }
  });

  it('refuses own jobs, duplicates and the active ceiling', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const now = new Date();
    const own = await applyToJob(
      deps,
      jobId,
      'publisher-1',
      'Own application',
      'I should not be able to apply to my own job posting.',
      null,
      DEFAULT_JOB_LIMITS,
      now,
    );
    expect(own.ok).toBe(false);

    const limits = resolveJobLimits({ jobMaxActiveApplications: 1 });
    await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      limits,
      now,
    );
    const duplicate = await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      limits,
      now,
    );
    expect(duplicate.ok).toBe(false);

    const second = await openJob(deps, 'Second role');
    const over = await applyToJob(
      deps,
      second,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      limits,
      now,
    );
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.error.meta.code).toBe('ACTIVE_APPLICATION_LIMIT');
  });

  it('withdrawal frees an active slot and is applicant-only', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const limits = resolveJobLimits({ jobMaxActiveApplications: 1 });
    const now = new Date();
    const applied = await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      limits,
      now,
    );
    if (!applied.ok) throw new Error('setup failed');
    const stranger = await withdrawApplication(deps, applied.value.id, 'someone', now);
    expect(stranger.ok).toBe(false);
    const withdrawn = await withdrawApplication(deps, applied.value.id, 'applicant-1', now);
    expect(withdrawn.ok).toBe(true);

    const second = await openJob(deps, 'Second role');
    const again = await applyToJob(
      deps,
      second,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      limits,
      now,
    );
    expect(again.ok).toBe(true);
  });

  it('requires a reason to reject', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const now = new Date();
    const applied = await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      DEFAULT_JOB_LIMITS,
      now,
    );
    if (!applied.ok) throw new Error('setup failed');
    const rejected = await rejectApplication(
      deps,
      applied.value.id,
      'publisher-1',
      'member',
      now,
      'jobs:reasons.notQualified',
    );
    expect(rejected.ok).toBe(true);
    if (rejected.ok) expect(rejected.value.rejectedAt).toBeTruthy();
  });
});

describe('CV privacy', () => {
  it('only the concerned employer can read the CV file id', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const now = new Date();
    const applied = await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      'cv-file-1',
      DEFAULT_JOB_LIMITS,
      now,
    );
    if (!applied.ok) throw new Error('setup failed');

    const denied = await readApplicantCvFileId(deps, applied.value.id, 'other-employer', 'member');
    expect(denied.ok).toBe(false);
    const volunteerDenied = await readApplicantCvFileId(
      deps,
      applied.value.id,
      'publisher-1',
      'guest',
    );
    expect(volunteerDenied.ok).toBe(false);
    const allowed = await readApplicantCvFileId(deps, applied.value.id, 'publisher-1', 'member');
    expect(allowed.ok).toBe(true);
    if (allowed.ok) expect(allowed.value).toBe('cv-file-1');
  });

  it('returns NotFound when no CV was attached', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const applied = await applyToJob(
      deps,
      jobId,
      'applicant-1',
      'Retail experience',
      'I have two years of shop experience and can start immediately.',
      null,
      DEFAULT_JOB_LIMITS,
      new Date(),
    );
    if (!applied.ok) throw new Error('setup failed');
    const missing = await readApplicantCvFileId(deps, applied.value.id, 'publisher-1', 'member');
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.error.meta.code).toBe('CV_NOT_FOUND');
    expect(createMockStorageProvider).toBeDefined();
  });
});

describe('saves and reports', () => {
  it('saves once and reports with an audited resolution', async () => {
    const deps = setup();
    const jobId = await openJob(deps);
    const engagementDeps = { engagement: deps.engagement, audit: deps.audit };
    await saveJob(engagementDeps, jobId, 'user-1');
    await saveJob(engagementDeps, jobId, 'user-1');
    const saved = await deps.engagement.listSaved('user-1');
    if (saved.ok) expect(saved.value.length).toBe(1);

    const report = await reportJob(
      engagementDeps,
      jobId,
      'user-1',
      'jobs:report.reasons.fake',
      'The publisher asks for money to schedule an interview.',
    );
    expect(report.ok).toBe(true);
    if (!report.ok) return;
    const denied = await resolveJobReport(
      engagementDeps,
      report.value.id,
      'member',
      'user-1',
      'resolved',
    );
    expect(denied.ok).toBe(false);
    const resolved = await resolveJobReport(
      engagementDeps,
      report.value.id,
      'moderator',
      'mod-1',
      'resolved',
    );
    expect(resolved.ok).toBe(true);
  });
});
