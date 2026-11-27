import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CreateJobApplicationInput,
  JobApplication,
  JobApplicationRepository,
  UpdateJobApplicationInput,
} from '../contracts/job-application';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockJobApplicationRepository(
  options: MockRepositoryOptions = {},
): JobApplicationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, JobApplication>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<JobApplication | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async listByJob(jobId: string): Promise<Result<readonly JobApplication[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((a) => a.jobId === jobId));
    },

    async listByApplicant(applicantId: string): Promise<Result<readonly JobApplication[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((a) => a.applicantId === applicantId));
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<JobApplication>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async create(input: CreateJobApplicationInput): Promise<Result<JobApplication>> {
      if (!input.jobId || !input.applicantId || !input.headline.trim() || !input.message.trim()) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_APPLICATION' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const record: JobApplication = Object.freeze({
        id: `mock-job-application-${Date.now()}-${counter}`,
        jobId: input.jobId,
        applicantId: input.applicantId,
        headline: input.headline.trim().slice(0, 200),
        message: input.message.trim().slice(0, 1000),
        cvFileId: input.cvFileId ?? null,
        status: 'submitted' as const,
        submittedAt: now,
        viewedAt: null,
        shortlistedAt: null,
        rejectedAt: null,
        hiredAt: null,
        withdrawnAt: null,
        reasonKey: null,
        decidedBy: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(record.id, record);
      return ok(record);
    },

    async update(
      id: string,
      input: UpdateJobApplicationInput,
    ): Promise<Result<JobApplication>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
      }
      const updated: JobApplication = Object.freeze({
        ...existing,
        ...(input.status !== undefined && { status: input.status }),
        ...(input.headline !== undefined && { headline: input.headline }),
        ...(input.message !== undefined && { message: input.message }),
        ...(input.cvFileId !== undefined && { cvFileId: input.cvFileId }),
        ...(input.viewedAt !== undefined && { viewedAt: input.viewedAt }),
        ...(input.shortlistedAt !== undefined && { shortlistedAt: input.shortlistedAt }),
        ...(input.rejectedAt !== undefined && { rejectedAt: input.rejectedAt }),
        ...(input.hiredAt !== undefined && { hiredAt: input.hiredAt }),
        ...(input.withdrawnAt !== undefined && { withdrawnAt: input.withdrawnAt }),
        ...(input.reasonKey !== undefined && { reasonKey: input.reasonKey }),
        ...(input.decidedBy !== undefined && { decidedBy: input.decidedBy }),
        updatedAt: new Date().toISOString(),
      });
      byId.set(id, updated);
      return ok(updated);
    },
  });
}
