import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CreateJobReportInput,
  JobEngagementRepository,
  JobReport,
  JobReportStatus,
  JobSave,
} from '../contracts/job-engagement';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockJobEngagementRepository(
  options: MockRepositoryOptions = {},
): JobEngagementRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const saves = new Map<string, JobSave>();
  const reports = new Map<string, JobReport>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function nextId(prefix: string): string {
    counter += 1;
    return `mock-${prefix}-${Date.now()}-${counter}`;
  }

  return Object.freeze({
    async save(userId: string, jobId: string): Promise<Result<JobSave>> {
      if (!userId || !jobId) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_SAVE' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const existing of saves.values()) {
        if (existing.userId === userId && existing.jobId === jobId) return ok(existing);
      }
      const now = new Date().toISOString();
      const record: JobSave = Object.freeze({
        id: nextId('job-save'),
        userId,
        jobId,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      saves.set(record.id, record);
      return ok(record);
    },

    async unsave(userId: string, jobId: string): Promise<Result<void>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const [key, record] of saves.entries()) {
        if (record.userId === userId && record.jobId === jobId) saves.delete(key);
      }
      return ok(undefined);
    },

    async listSaved(userId: string): Promise<Result<readonly JobSave[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(saves.values()).filter((s) => s.userId === userId));
    },

    async getReport(id: string): Promise<Result<JobReport | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(reports.get(id) ?? null);
    },

    async listReportsByJob(jobId: string): Promise<Result<readonly JobReport[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(reports.values()).filter((r) => r.jobId === jobId));
    },

    async listReports(query?: ListQuery): Promise<Result<PagedResult<JobReport>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(reports.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async createReport(input: CreateJobReportInput): Promise<Result<JobReport>> {
      if (!input.jobId || !input.reporterId || !input.reasonKey || !input.detail.trim()) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_REPORT' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const record: JobReport = Object.freeze({
        id: nextId('job-report'),
        jobId: input.jobId,
        reporterId: input.reporterId,
        reasonKey: input.reasonKey,
        detail: input.detail.trim().slice(0, 1000),
        status: 'open' as const,
        resolvedBy: null,
        resolvedAt: null,
        resolutionKey: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      reports.set(record.id, record);
      return ok(record);
    },

    async updateReportStatus(
      id: string,
      status: JobReportStatus,
      actorId: string,
      resolutionKey?: string | null,
    ): Promise<Result<JobReport>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = reports.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'REPORT_NOT_FOUND' }) };
      }
      const now = new Date().toISOString();
      const settled = status === 'resolved' || status === 'dismissed';
      const updated: JobReport = Object.freeze({
        ...existing,
        status,
        resolvedBy: settled ? actorId : null,
        resolvedAt: settled ? now : null,
        resolutionKey: resolutionKey ?? null,
        updatedAt: now,
      });
      reports.set(id, updated);
      return ok(updated);
    },
  });
}
