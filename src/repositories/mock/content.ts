import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';

import type { ContentRecord, ContentRepository } from '../contracts/content';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockContentRepository(
  options: MockRepositoryOptions = {},
  seed: readonly ContentRecord[] = [],
): ContentRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, ContentRecord>();
  const bySlug = new Map<string, ContentRecord>();
  for (const record of seed) {
    byId.set(record.id, record);
    bySlug.set(record.slug, record);
  }

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<ContentRecord | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async getBySlug(slug: string): Promise<Result<ContentRecord | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(bySlug.get(slug) ?? null);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<ContentRecord>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      const items = all.slice(offset, offset + limit);
      return ok({ items, total: all.length, limit, offset });
    },
  });
}
