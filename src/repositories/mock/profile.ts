import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import {
  CreateProfileInputSchema,
  UpdateProfileInputSchema,
} from '@/schemas/profile';

import type {
  CreateProfileInput,
  Profile,
  ProfileListQuery,
  ProfileRepository,
  UpdateProfileInput,
} from '../contracts/profile';
import type { PagedResult } from '../types';

export interface MockRepositoryOptions {
  readonly delayMs?: number;
  readonly forceErrorKind?: 'Network' | 'Unknown' | 'Validation' | null;
}

export function createMockProfileRepository(
  options: MockRepositoryOptions = {},
): ProfileRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, Profile>();

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function nowIso(): string {
    return new Date().toISOString();
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<Profile | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async getByUserId(userId: string): Promise<Result<Profile | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const p of byId.values()) if (p.userId === userId) return ok(p);
      return ok(null);
    },

    async create(input: CreateProfileInput): Promise<Result<Profile>> {
      const parsed = CreateProfileInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const id = `mock-profile-${Date.now()}-${byId.size}`;
      const profile: Profile = Object.freeze({
        id,
        userId: parsed.data.userId,
        displayName: parsed.data.displayName,
        gender: parsed.data.gender,
        maritalStatus: parsed.data.maritalStatus,
        city: parsed.data.city ?? null,
        phone: parsed.data.phone ?? null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        dataOrigin: 'demo' as const,
      });
      byId.set(id, profile);
      return ok(profile);
    },

    async update(id: string, input: UpdateProfileInput): Promise<Result<Profile>> {
      const parsed = UpdateProfileInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'PROFILE_NOT_FOUND' }) };
      }
      const updated: Profile = Object.freeze({
        ...existing,
        ...(parsed.data.displayName !== undefined && { displayName: parsed.data.displayName }),
        ...(parsed.data.gender !== undefined && { gender: parsed.data.gender }),
        ...(parsed.data.maritalStatus !== undefined && {
          maritalStatus: parsed.data.maritalStatus,
        }),
        ...(parsed.data.city !== undefined && { city: parsed.data.city }),
        ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
        updatedAt: nowIso(),
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

    async list(query?: ProfileListQuery): Promise<Result<PagedResult<Profile>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      let items: Profile[] = Array.from(byId.values());
      if (query?.city) items = items.filter((p) => p.city === query.city);
      if (query?.maritalStatus) items = items.filter((p) => p.maritalStatus === query.maritalStatus);
      const total = items.length;
      items = items.slice(offset, offset + limit);
      return ok({ items, total, limit, offset });
    },
  });
}
