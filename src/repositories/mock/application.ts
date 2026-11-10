import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { CreateApplicationInputSchema } from '@/schemas/application';

import type {
  Application,
  ApplicationListQuery,
  ApplicationRepository,
  ApplicationStatus,
  CreateApplicationInput,
} from '../contracts/application';
import type { PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockApplicationRepository(
  options: MockRepositoryOptions = {},
): ApplicationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, Application>();

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<Application | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async list(query?: ApplicationListQuery): Promise<Result<PagedResult<Application>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      let items: Application[] = Array.from(byId.values());
      if (query?.status) items = items.filter((a) => a.status === query.status);
      if (query?.programId) items = items.filter((a) => a.programId === query.programId);
      if (query?.applicantId) items = items.filter((a) => a.applicantId === query.applicantId);
      const total = items.length;
      items = items.slice(offset, offset + limit);
      return ok({ items, total, limit, offset });
    },

    async listByApplicant(applicantId: string): Promise<Result<readonly Application[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const items = Array.from(byId.values()).filter((a) => a.applicantId === applicantId);
      return ok(items);
    },

    async create(input: CreateApplicationInput): Promise<Result<Application>> {
      const parsed = CreateApplicationInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const id = `mock-application-${Date.now()}-${byId.size}`;
      const now = new Date().toISOString();
      const app: Application = Object.freeze({
        id,
        applicantId: parsed.data.applicantId,
        programId: parsed.data.programId,
        status: 'draft' as const,
        requestedAmount: parsed.data.requestedAmount,
        currency: 'YER' as const,
        notes: parsed.data.notes ?? null,
        reviewerNote: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(id, app);
      return ok(app);
    },

    async updateStatus(
      id: string,
      status: ApplicationStatus,
      reviewerNote?: string,
    ): Promise<Result<Application>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
      }
      const updated: Application = Object.freeze({
        ...existing,
        status,
        ...(reviewerNote !== undefined && { reviewerNote }),
        updatedAt: new Date().toISOString(),
      });
      byId.set(id, updated);
      return ok(updated);
    },

    async delete(id: string): Promise<Result<void>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      byId.delete(id);
      return ok(undefined);
    },
  });
}
