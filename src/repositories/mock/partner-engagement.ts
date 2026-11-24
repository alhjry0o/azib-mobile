import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { OfferSave, PartnerEngagementRepository } from '../contracts/partner-engagement';
import type { MockRepositoryOptions } from './profile';

export function createMockPartnerEngagementRepository(
  options: MockRepositoryOptions = {},
): PartnerEngagementRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const saves = new Map<string, OfferSave>();
  // Aggregate counters only. No viewer identity is ever recorded (D-8).
  const views = new Map<string, number>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async save(userId: string, offerId: string): Promise<Result<OfferSave>> {
      if (!userId || !offerId) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_SAVE' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const existing of saves.values()) {
        if (existing.userId === userId && existing.offerId === offerId) return ok(existing);
      }
      counter += 1;
      const now = new Date().toISOString();
      const record: OfferSave = Object.freeze({
        id: `mock-offer-save-${Date.now()}-${counter}`,
        userId,
        offerId,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      saves.set(record.id, record);
      return ok(record);
    },

    async unsave(userId: string, offerId: string): Promise<Result<void>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const [key, record] of saves.entries()) {
        if (record.userId === userId && record.offerId === offerId) saves.delete(key);
      }
      return ok(undefined);
    },

    async listSaved(userId: string): Promise<Result<readonly OfferSave[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(saves.values()).filter((s) => s.userId === userId));
    },

    async recordView(offerId: string): Promise<Result<number>> {
      if (!offerId) return { ok: false, error: AppError.validation({ code: 'INVALID_OFFER' }) };
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const next = (views.get(offerId) ?? 0) + 1;
      views.set(offerId, next);
      return ok(next);
    },

    async getViews(offerId: string): Promise<Result<number>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(views.get(offerId) ?? 0);
    },

    async getViewsForOffers(
      offerIds: readonly string[],
    ): Promise<Result<Readonly<Record<string, number>>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const out: Record<string, number> = {};
      for (const id of offerIds) out[id] = views.get(id) ?? 0;
      return ok(Object.freeze(out));
    },
  });
}
