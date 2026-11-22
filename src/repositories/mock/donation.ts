import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { CreateDonationInputSchema } from '@/schemas/donation';
import type {
  CreateDonationInput,
  Donation,
  DonationActor,
  DonationEvent,
  DonationRepository,
  DonationStatus,
} from '../contracts/donation';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

// Event → target status. This is NOT the transition table: the finance
// service validates every transition through the pure machine (ADR-0027).
const EVENT_TARGET: Record<DonationEvent['type'], DonationStatus> = {
  handoff: 'provider_pending',
  provider_confirm: 'provider_confirmed',
  provider_decline: 'declined',
  verify: 'verified',
  verification_decline: 'declined',
  cancel: 'cancelled',
};

export function createMockDonationRepository(
  options: MockRepositoryOptions = {},
): DonationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, Donation>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<Donation | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async create(input: CreateDonationInput): Promise<Result<Donation>> {
      const parsed = CreateDonationInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };

      // Idempotency: same donor + same key ⇒ the very same intent.
      const key = parsed.data.idempotencyKey ?? null;
      if (key !== null) {
        for (const existing of byId.values()) {
          if (existing.donorId === parsed.data.donorId && existing.idempotencyKey === key) {
            return ok(existing);
          }
        }
      }

      counter += 1;
      const id = `mock-donation-${Date.now()}-${counter}`;
      const now = new Date().toISOString();
      const donation: Donation = Object.freeze({
        id,
        donorId: parsed.data.donorId,
        amount: parsed.data.amount,
        currency: 'YER' as const,
        status: 'intent_created' as const,
        note: parsed.data.note ?? null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
        programId: parsed.data.programId ?? null,
        anonymous: parsed.data.anonymous ?? false,
        idempotencyKey: key,
        providerReference: null,
        receiptNumber: null,
        verifiedAt: null,
        verifiedBy: null,
      });
      byId.set(id, donation);
      return ok(donation);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<Donation>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      const items = all.slice(offset, offset + limit);
      return ok({ items, total: all.length, limit, offset });
    },

    async listByDonor(donorId: string): Promise<Result<PagedResult<Donation>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const items = Array.from(byId.values()).filter((d) => d.donorId === donorId);
      return ok({ items, total: items.length, limit: items.length, offset: 0 });
    },

    async advance(
      id: string,
      event: DonationEvent,
      _actor: DonationActor,
    ): Promise<Result<Donation>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'DONATION_NOT_FOUND' }) };
      }
      const now = new Date().toISOString();
      const next: Donation = Object.freeze({
        ...existing,
        status: EVENT_TARGET[event.type],
        updatedAt: now,
        ...(event.type === 'handoff' || event.type === 'provider_confirm'
          ? { providerReference: event.providerReference }
          : {}),
        ...(event.type === 'verify'
          ? {
              receiptNumber: existing.receiptNumber ?? event.receiptNumber,
              verifiedAt: now,
              verifiedBy: event.verifiedBy,
            }
          : {}),
      });
      byId.set(id, next);
      return ok(next);
    },
  });
}
