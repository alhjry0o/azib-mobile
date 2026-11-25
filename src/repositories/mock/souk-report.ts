import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CreateSoukReportInput,
  SoukReport,
  SoukReportRepository,
  SoukReportStatus,
} from '../contracts/souk-report';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockSoukReportRepository(
  options: MockRepositoryOptions = {},
): SoukReportRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, SoukReport>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<SoukReport | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async listByItem(itemId: string): Promise<Result<readonly SoukReport[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((r) => r.itemId === itemId));
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<SoukReport>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async create(input: CreateSoukReportInput): Promise<Result<SoukReport>> {
      if (
        !input.itemId ||
        !input.targetId ||
        !input.reporterId ||
        !input.reasonKey ||
        !input.detail.trim()
      ) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_REPORT' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const record: SoukReport = Object.freeze({
        id: `mock-souk-report-${Date.now()}-${counter}`,
        itemId: input.itemId,
        targetKind: input.targetKind,
        targetId: input.targetId,
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
      byId.set(record.id, record);
      return ok(record);
    },

    async updateStatus(
      id: string,
      status: SoukReportStatus,
      actorId: string,
      resolutionKey?: string | null,
    ): Promise<Result<SoukReport>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'REPORT_NOT_FOUND' }) };
      const now = new Date().toISOString();
      const settled = status === 'resolved' || status === 'dismissed';
      const updated: SoukReport = Object.freeze({
        ...existing,
        status,
        resolvedBy: settled ? actorId : null,
        resolvedAt: settled ? now : null,
        resolutionKey: resolutionKey ?? null,
        updatedAt: now,
      });
      byId.set(id, updated);
      return ok(updated);
    },
  });
}
