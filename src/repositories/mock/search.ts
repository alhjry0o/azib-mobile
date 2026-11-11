// SearchRepository mock delegates to an injected SearchProvider.
// No duplicated search logic. The provider is the single source of the search index.

import { ok, type Result } from '@/core/result';

import type { SearchProvider } from '@/providers/contracts';

import type { SearchRepository } from '../contracts/search';
import type { ListQuery } from '../types';

export function createMockSearchRepository(searchProvider: SearchProvider): SearchRepository {
  return Object.freeze({
    async search<T = Record<string, unknown>>(
      text: string,
      query?: ListQuery,
    ): Promise<Result<readonly T[]>> {
      const r = await searchProvider.query<T>({
        text,
        ...(query?.limit !== undefined && { limit: query.limit }),
      });
      if (!r.ok) return r;
      return ok(r.value.map((hit) => hit.item));
    },
  });
}
