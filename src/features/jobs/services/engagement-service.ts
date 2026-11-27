import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type {
  JobEngagementRepository,
  JobReport,
  JobReportStatus,
  JobSave,
} from '@/repositories/contracts/job-engagement';
import { JobReportSchema } from '../schemas';
import { canJob, type JobRole } from '../state/permissions';

export interface JobEngagementDeps {
  readonly engagement: JobEngagementRepository;
  readonly audit: AuditRepository;
}

export async function saveJob(
  deps: JobEngagementDeps,
  jobId: string,
  userId: string,
): Promise<Result<JobSave>> {
  if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  return deps.engagement.save(userId, jobId);
}

export async function unsaveJob(
  deps: JobEngagementDeps,
  jobId: string,
  userId: string,
): Promise<Result<void>> {
  if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  return deps.engagement.unsave(userId, jobId);
}

export async function reportJob(
  deps: JobEngagementDeps,
  jobId: string,
  reporterId: string,
  reasonKey: string,
  detail: string,
): Promise<Result<JobReport>> {
  if (!reporterId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = JobReportSchema.safeParse({ jobId, reasonKey, detail });
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const created = await deps.engagement.createReport({
    jobId,
    reporterId,
    reasonKey,
    detail: detail.trim(),
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: reporterId,
    action: 'job.reported',
    target: `job:${jobId}`,
    meta: { reasonKey },
  });
  return ok(created.value);
}

export async function resolveJobReport(
  deps: JobEngagementDeps,
  reportId: string,
  actorRole: JobRole,
  actorId: string,
  status: JobReportStatus,
  resolutionKey?: string,
): Promise<Result<JobReport>> {
  if (!canJob(actorRole, 'resolve_report')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const moved = await deps.engagement.updateReportStatus(
    reportId,
    status,
    actorId,
    resolutionKey ?? null,
  );
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `job.report.${status}`,
    target: `job-report:${reportId}`,
  });
  return ok(moved.value);
}
