import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  CreateSoukRequestInput,
  SoukRequest,
  SoukRequestRepository,
  UpdateSoukRequestInput,
} from '../contracts/souk-request';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockSoukRequestRepository(
  options: MockRepositoryOptions = {},
): SoukRequestRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, SoukRequest>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<SoukRequest | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async listByItem(itemId: string): Promise<Result<readonly SoukRequest[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((r) => r.itemId === itemId));
    },

    async listByRequester(requesterId: string): Promise<Result<readonly SoukRequest[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((r) => r.requesterId === requesterId));
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<SoukRequest>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async create(input: CreateSoukRequestInput): Promise<Result<SoukRequest>> {
      if (!input.itemId || !input.requesterId || !input.reason.trim()) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_REQUEST' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const record: SoukRequest = Object.freeze({
        id: `mock-souk-request-${Date.now()}-${counter}`,
        itemId: input.itemId,
        requesterId: input.requesterId,
        reason: input.reason.trim().slice(0, 500),
        status: 'pending' as const,
        decidedBy: null,
        decidedAt: null,
        reasonKey: null,
        handoverCode: null,
        donorContactConsent: false,
        recipientContactConsent: false,
        donorConfirmedAt: null,
        recipientConfirmedAt: null,
        handedOverAt: null,
        rating: null,
        ratingNote: null,
        ratedBy: null,
        ratedAt: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(record.id, record);
      return ok(record);
    },

    async update(id: string, input: UpdateSoukRequestInput): Promise<Result<SoukRequest>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };
      }
      const updated: SoukRequest = Object.freeze({
        ...existing,
        ...(input.status !== undefined && { status: input.status }),
        ...(input.decidedBy !== undefined && { decidedBy: input.decidedBy }),
        ...(input.decidedAt !== undefined && { decidedAt: input.decidedAt }),
        ...(input.reasonKey !== undefined && { reasonKey: input.reasonKey }),
        ...(input.handoverCode !== undefined && { handoverCode: input.handoverCode }),
        ...(input.donorContactConsent !== undefined && {
          donorContactConsent: input.donorContactConsent,
        }),
        ...(input.recipientContactConsent !== undefined && {
          recipientContactConsent: input.recipientContactConsent,
        }),
        ...(input.donorConfirmedAt !== undefined && {
          donorConfirmedAt: input.donorConfirmedAt,
        }),
        ...(input.recipientConfirmedAt !== undefined && {
          recipientConfirmedAt: input.recipientConfirmedAt,
        }),
        ...(input.handedOverAt !== undefined && { handedOverAt: input.handedOverAt }),
        ...(input.rating !== undefined && { rating: input.rating }),
        ...(input.ratingNote !== undefined && { ratingNote: input.ratingNote }),
        ...(input.ratedBy !== undefined && { ratedBy: input.ratedBy }),
        ...(input.ratedAt !== undefined && { ratedAt: input.ratedAt }),
        updatedAt: new Date().toISOString(),
      });
      byId.set(id, updated);
      return ok(updated);
    },
  });
}
