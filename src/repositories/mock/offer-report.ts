import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CreateOfferReportInput,
  OfferReport,
  OfferReportRepository,
  OfferReportStatus,
} from '../contracts/offer-report';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockOfferReportRepository(
  options: MockRepositoryOptions = {},
): OfferReportRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, OfferReport>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<OfferReport | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async listByOffer(offerId: string): Promise<Result<readonly OfferReport[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((r) => r.offerId === offerId));
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<OfferReport>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async create(input: CreateOfferReportInput): Promise<Result<OfferReport>> {
      if (!input.offerId || !input.reporterId || !input.reasonKey || !input.detail.trim()) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_REPORT' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const report: OfferReport = Object.freeze({
        id: `mock-offer-report-${Date.now()}-${counter}`,
        offerId: input.offerId,
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
      byId.set(report.id, report);
      return ok(report);
    },

    async updateStatus(
      id: string,
      status: OfferReportStatus,
      actorId: string,
      resolutionKey?: string | null,
    ): Promise<Result<OfferReport>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'REPORT_NOT_FOUND' }) };
      const now = new Date().toISOString();
      const settled = status === 'resolved' || status === 'dismissed';
      const updated: OfferReport = Object.freeze({
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
