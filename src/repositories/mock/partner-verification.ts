import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  DecideVerificationInput,
  PartnerVerification,
  PartnerVerificationRepository,
  SubmitVerificationInput,
} from '../contracts/partner-verification';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockPartnerVerificationRepository(
  options: MockRepositoryOptions = {},
): PartnerVerificationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, PartnerVerification>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<PartnerVerification | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async getLatest(partnerId: string): Promise<Result<PartnerVerification | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      let latest: PartnerVerification | null = null;
      for (const record of byId.values()) {
        if (record.partnerId !== partnerId) continue;
        if (latest === null || record.createdAt > latest.createdAt) latest = record;
      }
      return ok(latest);
    },

    async listByPartner(partnerId: string): Promise<Result<readonly PartnerVerification[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(byId.values()).filter((r) => r.partnerId === partnerId));
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<PartnerVerification>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      return ok({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
    },

    async submit(input: SubmitVerificationInput): Promise<Result<PartnerVerification>> {
      if (!input.partnerId || !input.submittedBy || input.documentFileIds.length === 0) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_VERIFICATION' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const now = new Date().toISOString();
      const record: PartnerVerification = Object.freeze({
        id: `mock-verification-${Date.now()}-${counter}`,
        partnerId: input.partnerId,
        submittedBy: input.submittedBy,
        status: 'pending' as const,
        documentFileIds: Object.freeze([...input.documentFileIds]),
        decidedBy: null,
        decidedAt: null,
        reasonKey: null,
        validUntil: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(record.id, record);
      return ok(record);
    },

    async decide(
      id: string,
      input: DecideVerificationInput,
    ): Promise<Result<PartnerVerification>> {
      if (input.decision === 'rejected' && !input.reasonKey) {
        return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'VERIFICATION_NOT_FOUND' }) };
      }
      if (existing.status !== 'pending') {
        return { ok: false, error: AppError.conflict({ code: 'ALREADY_DECIDED' }) };
      }
      const now = new Date().toISOString();
      const updated: PartnerVerification = Object.freeze({
        ...existing,
        status: input.decision,
        decidedBy: input.decidedBy,
        decidedAt: now,
        reasonKey: input.reasonKey ?? null,
        validUntil: input.validUntil ?? null,
        updatedAt: now,
      });
      byId.set(id, updated);
      return ok(updated);
    },
  });
}
