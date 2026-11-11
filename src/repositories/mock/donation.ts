import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { CreateDonationInputSchema } from '@/schemas/donation';

import type {
  CreateDonationInput,
  Donation,
  DonationRepository,
} from '../contracts/donation';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

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
      counter += 1;
      const id = `mock-donation-${Date.now()}-${counter}`;
      const now = new Date().toISOString();
      const donation: Donation = Object.freeze({
        id,
        donorId: parsed.data.donorId,
        amount: parsed.data.amount,
        currency: 'YER' as const,
        status: 'pending' as const,
        note: parsed.data.note ?? null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
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
  });
}
