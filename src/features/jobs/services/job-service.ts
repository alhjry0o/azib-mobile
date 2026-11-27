// Job lifecycle. The machine is checked BEFORE any write (ADR-0060).
// Review-before-publish is DERIVED from settings, never a caller flag.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { Job, JobRepository } from '@/repositories/contracts/job';
import { checkChatRate } from '@/features/weddings/chat/rate-limit';
import { filterChatMessage } from '@/features/weddings/chat/message-filter';
import { JobDraftSchema } from '../schemas';
import {
  assertJobTransition,
  toJobWorkflowStatus,
  type JobActor,
  type JobWorkflowStatus,
} from '../state/job-machine';
import { jobExpiryFrom } from '../state/expiry';
import type { JobLimits } from '../state/limits';
import { canJob, type JobRole } from '../state/permissions';

export interface JobDeps {
  readonly jobs: JobRepository;
  readonly audit: AuditRepository;
}

export interface CreateJobInput {
  readonly publisherId: string;
  readonly publisherName: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly workType: 'daily' | 'professional' | 'freelance' | 'internship';
  readonly schedule: 'full_time' | 'part_time' | 'shifts' | 'flexible';
  readonly salaryMin: number | null;
  readonly salaryMax: number | null;
  readonly requirements: readonly string[];
  readonly applicationMethod: 'in_app' | 'external_instructions';
  readonly applicationInstructions: string | null;
  readonly deadline: string | null;
  readonly publisherTermsAccepted: boolean;
  readonly partnerId?: string | null;
}

/** Screens descriptions/instructions for contact data; length rule excluded. */
function screenText(text: string): boolean {
  const result = filterChatMessage(text);
  return result.allowed || result.reason === 'tooLong' || result.reason === 'empty';
}

async function loadJob(deps: JobDeps, jobId: string): Promise<Result<Job>> {
  const found = await deps.jobs.getById(jobId);
  if (!found.ok) return found;
  if (!found.value) return { ok: false, error: AppError.notFound({ code: 'JOB_NOT_FOUND' }) };
  return ok(found.value);
}

export async function createJobDraft(
  deps: JobDeps,
  input: CreateJobInput,
  limits: JobLimits,
  now: Date,
): Promise<Result<Job>> {
  if (!input.publisherId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = JobDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  if (!screenText(`${input.title} ${input.description}`)) {
    return { ok: false, error: AppError.validation({ code: 'JOB_CONTACT_IN_TEXT' }) };
  }
  if (input.applicationInstructions && !screenText(input.applicationInstructions)) {
    return { ok: false, error: AppError.validation({ code: 'JOB_CONTACT_IN_TEXT' }) };
  }

  const listed = await deps.jobs.list({ limit: 200 });
  if (!listed.ok) return listed;
  const mine = listed.value.items.filter((j) => j.publisherId === input.publisherId);
  const rate = checkChatRate(
    mine.map((j) => Date.parse(j.createdAt)),
    now.getTime(),
    limits.publishRate,
  );
  if (!rate.allowed) {
    return { ok: false, error: AppError.conflict({ code: 'JOB_RATE_LIMITED' }) };
  }

  const created = await deps.jobs.create({
    titleKey: 'jobs:customJob',
    status: 'draft',
    title: parsed.data.title,
    publisherId: input.publisherId,
    publisherName: parsed.data.publisherName,
    publisherTermsAcceptedAt: now.toISOString(),
    partnerId: input.partnerId ?? null,
    category: parsed.data.category,
    description: parsed.data.description,
    governorateId: parsed.data.governorateId,
    districtId: parsed.data.districtId,
    workType: parsed.data.workType,
    schedule: parsed.data.schedule,
    salaryMin: parsed.data.salaryMin,
    salaryMax: parsed.data.salaryMax,
    requirements: parsed.data.requirements,
    applicationMethod: parsed.data.applicationMethod,
    applicationInstructions: parsed.data.applicationInstructions,
    deadline: parsed.data.deadline,
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: input.publisherId,
    action: 'job.draft.created',
    target: `job:${created.value.id}`,
  });
  return ok(created.value);
}

async function move(
  deps: JobDeps,
  jobId: string,
  to: JobWorkflowStatus,
  actor: JobActor,
  actorId: string,
  patch: Parameters<JobRepository['update']>[1] = {},
): Promise<Result<Job>> {
  const job = await loadJob(deps, jobId);
  if (!job.ok) return job;
  const snapshot = job.value;
  const from = toJobWorkflowStatus(snapshot.status);
  const allowed = assertJobTransition(from, to, actor);
  if (!allowed.ok) return allowed;
  const moved = await deps.jobs.update(jobId, { ...patch, status: to });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `job.${to}`,
    target: `job:${jobId}`,
    meta: { from, to },
  });
  return ok(moved.value);
}

async function assertPublisher(
  deps: JobDeps,
  jobId: string,
  publisherId: string,
): Promise<Result<Job>> {
  const job = await loadJob(deps, jobId);
  if (!job.ok) return job;
  if (job.value.publisherId !== publisherId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_JOB_PUBLISHER' }) };
  }
  return ok(job.value);
}

/** Publishes directly, or routes through review when SETTINGS require it. */
export async function publishJob(
  deps: JobDeps,
  jobId: string,
  publisherId: string,
  limits: JobLimits,
  now: Date,
): Promise<Result<Job>> {
  const job = await assertPublisher(deps, jobId, publisherId);
  if (!job.ok) return job;
  if (!job.value.publisherTermsAcceptedAt) {
    return { ok: false, error: AppError.validation({ code: 'PUBLISHER_TERMS_REQUIRED' }) };
  }
  if (limits.requireReview) {
    return move(deps, jobId, 'pending_review', 'publisher', publisherId);
  }
  return move(deps, jobId, 'open', 'publisher', publisherId, {
    expiresAt: jobExpiryFrom(now.toISOString(), limits.jobExpiryDays),
  });
}

export async function reviewJob(
  deps: JobDeps,
  jobId: string,
  actorRole: JobRole,
  actorId: string,
  decision: 'open' | 'rejected',
  limits: JobLimits,
  now: Date,
  reasonKey?: string,
): Promise<Result<Job>> {
  if (!canJob(actorRole, 'review_job')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (decision === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  return move(deps, jobId, decision, 'moderator', actorId, {
    ...(decision === 'open'
      ? { expiresAt: jobExpiryFrom(now.toISOString(), limits.jobExpiryDays) }
      : { rejectionReasonKey: reasonKey ?? null }),
  });
}

export async function closeJob(
  deps: JobDeps,
  jobId: string,
  publisherId: string,
): Promise<Result<Job>> {
  const owned = await assertPublisher(deps, jobId, publisherId);
  if (!owned.ok) return owned;
  return move(deps, jobId, 'closed', 'publisher', publisherId);
}

export async function reopenJob(
  deps: JobDeps,
  jobId: string,
  publisherId: string,
  limits: JobLimits,
  now: Date,
): Promise<Result<Job>> {
  const owned = await assertPublisher(deps, jobId, publisherId);
  if (!owned.ok) return owned;
  return move(deps, jobId, 'open', 'publisher', publisherId, {
    expiresAt: jobExpiryFrom(now.toISOString(), limits.jobExpiryDays),
  });
}

/** System-only: the client computes expiry but never writes it. */
export async function expireJob(
  deps: JobDeps,
  jobId: string,
  actorId: string,
): Promise<Result<Job>> {
  return move(deps, jobId, 'expired', 'system', actorId);
}

export async function relistJob(
  deps: JobDeps,
  jobId: string,
  publisherId: string,
): Promise<Result<Job>> {
  const owned = await assertPublisher(deps, jobId, publisherId);
  if (!owned.ok) return owned;
  return move(deps, jobId, 'draft', 'publisher', publisherId, {
    expiresAt: null,
    rejectionReasonKey: null,
  });
}
