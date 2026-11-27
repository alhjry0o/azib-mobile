import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { JobRepository } from '@/repositories/contracts/job';
import type {
  JobApplication,
  JobApplicationRepository,
} from '@/repositories/contracts/job-application';
import { checkChatRate } from '@/features/weddings/chat/rate-limit';
import { JobApplicationSchema } from '../schemas';
import {
  assertApplicationTransition,
  isActiveApplicationStatus,
  toApplicationWorkflowStatus,
  type ApplicationWorkflowStatus,
} from '../state/application-machine';
import { isAcceptingApplications } from '../state/expiry';
import type { JobLimits } from '../state/limits';
import { canViewApplicants, type JobRole } from '../state/permissions';

export interface ApplicationDeps {
  readonly jobs: JobRepository;
  readonly jobApplications: JobApplicationRepository;
  readonly audit: AuditRepository;
}

export async function applyToJob(
  deps: ApplicationDeps,
  jobId: string,
  applicantId: string,
  headline: string,
  message: string,
  cvFileId: string | null,
  limits: JobLimits,
  now: Date,
): Promise<Result<JobApplication>> {
  if (!applicantId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = JobApplicationSchema.safeParse({ headline, message });
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const job = await deps.jobs.getById(jobId);
  if (!job.ok) return job;
  if (!job.value) return { ok: false, error: AppError.notFound({ code: 'JOB_NOT_FOUND' }) };
  const snapshot = job.value;
  if (snapshot.publisherId === applicantId) {
    return { ok: false, error: AppError.conflict({ code: 'OWN_JOB' }) };
  }
  if (!isAcceptingApplications(snapshot, now)) {
    return { ok: false, error: AppError.conflict({ code: 'JOB_NOT_OPEN' }) };
  }

  const mine = await deps.jobApplications.listByApplicant(applicantId);
  if (!mine.ok) return mine;
  const active = mine.value.filter((a) =>
    isActiveApplicationStatus(toApplicationWorkflowStatus(a.status)),
  );
  if (active.length >= limits.maxActiveApplications) {
    return { ok: false, error: AppError.conflict({ code: 'ACTIVE_APPLICATION_LIMIT' }) };
  }
  if (active.some((a) => a.jobId === jobId)) {
    return { ok: false, error: AppError.conflict({ code: 'DUPLICATE_APPLICATION' }) };
  }
  const rate = checkChatRate(
    mine.value.map((a) => Date.parse(a.createdAt)),
    now.getTime(),
    limits.applyRate,
  );
  if (!rate.allowed) {
    return { ok: false, error: AppError.conflict({ code: 'APPLY_RATE_LIMITED' }) };
  }

  const created = await deps.jobApplications.create({
    jobId,
    applicantId,
    headline: parsed.data.headline,
    message: parsed.data.message,
    cvFileId,
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: applicantId,
    action: 'job.application.submitted',
    target: `job:${jobId}`,
  });
  return ok(created.value);
}

async function employerMove(
  deps: ApplicationDeps,
  applicationId: string,
  employerId: string,
  employerRole: JobRole,
  to: ApplicationWorkflowStatus,
  now: Date,
  reasonKey?: string,
): Promise<Result<JobApplication>> {
  const found = await deps.jobApplications.getById(applicationId);
  if (!found.ok) return found;
  const application = found.value;
  if (!application) {
    return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
  }
  const snapshot = application;
  const job = await deps.jobs.getById(snapshot.jobId);
  if (!job.ok) return job;
  if (!job.value) return { ok: false, error: AppError.notFound({ code: 'JOB_NOT_FOUND' }) };
  if (!canViewApplicants(employerRole, job.value.publisherId === employerId)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (to === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  const from = toApplicationWorkflowStatus(snapshot.status);
  const allowed = assertApplicationTransition(from, to, 'employer');
  if (!allowed.ok) return allowed;

  const stamp = now.toISOString();
  const patch =
    to === 'viewed'
      ? { viewedAt: stamp }
      : to === 'shortlisted'
        ? { shortlistedAt: stamp }
        : to === 'rejected'
          ? { rejectedAt: stamp, reasonKey: reasonKey ?? null }
          : { hiredAt: stamp };

  const moved = await deps.jobApplications.update(applicationId, {
    ...patch,
    status: to,
    decidedBy: employerId,
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId: employerId,
    action: `job.application.${to}`,
    target: `job-application:${applicationId}`,
    meta: { from, to },
  });
  return ok(moved.value);
}

export function markApplicationViewed(
  deps: ApplicationDeps,
  applicationId: string,
  employerId: string,
  employerRole: JobRole,
  now: Date,
): Promise<Result<JobApplication>> {
  return employerMove(deps, applicationId, employerId, employerRole, 'viewed', now);
}

export function shortlistApplication(
  deps: ApplicationDeps,
  applicationId: string,
  employerId: string,
  employerRole: JobRole,
  now: Date,
): Promise<Result<JobApplication>> {
  return employerMove(deps, applicationId, employerId, employerRole, 'shortlisted', now);
}

export function rejectApplication(
  deps: ApplicationDeps,
  applicationId: string,
  employerId: string,
  employerRole: JobRole,
  now: Date,
  reasonKey: string,
): Promise<Result<JobApplication>> {
  return employerMove(deps, applicationId, employerId, employerRole, 'rejected', now, reasonKey);
}

export function hireApplication(
  deps: ApplicationDeps,
  applicationId: string,
  employerId: string,
  employerRole: JobRole,
  now: Date,
): Promise<Result<JobApplication>> {
  return employerMove(deps, applicationId, employerId, employerRole, 'hired', now);
}

/** Withdrawal is the applicant's own action and frees an active slot. */
export async function withdrawApplication(
  deps: ApplicationDeps,
  applicationId: string,
  applicantId: string,
  now: Date,
): Promise<Result<JobApplication>> {
  const found = await deps.jobApplications.getById(applicationId);
  if (!found.ok) return found;
  const application = found.value;
  if (!application) {
    return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
  }
  const snapshot = application;
  if (snapshot.applicantId !== applicantId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_APPLICATION_OWNER' }) };
  }
  const from = toApplicationWorkflowStatus(snapshot.status);
  const allowed = assertApplicationTransition(from, 'withdrawn', 'applicant');
  if (!allowed.ok) return allowed;
  const moved = await deps.jobApplications.update(applicationId, {
    status: 'withdrawn',
    withdrawnAt: now.toISOString(),
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId: applicantId,
    action: 'job.application.withdrawn',
    target: `job-application:${applicationId}`,
    meta: { from, to: 'withdrawn' },
  });
  return ok(moved.value);
}
