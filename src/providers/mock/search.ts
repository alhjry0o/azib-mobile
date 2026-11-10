// In-memory SearchProvider. Case-insensitive substring search.
// Items are injected via the factory; seed populates in Part 5.

import type { Result } from '@/core/result';

import type { SearchHit, SearchProvider, SearchQuery } from '../contracts/search';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, type MockProviderConfig } from './config';

export function createMockSearchProvider<T = Record<string, unknown>>(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
  items: readonly SearchHit<T>[] = [],
): SearchProvider {
  return Object.freeze({
    name: 'search' as const,
    mode: 'mock' as const,
    capabilities: ['query'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async query<U = Record<string, unknown>>(q: SearchQuery): Promise<Result<SearchHit<U>[]>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const needle = q.text.trim().toLowerCase();
      if (!needle) return { ok: true, value: [] };
      const limit = q.limit ?? 20;
      const hits: SearchHit<U>[] = [];
      for (const raw of items) {
        const haystack = JSON.stringify(raw.item).toLowerCase();
        if (haystack.includes(needle)) {
          hits.push(raw as unknown as SearchHit<U>);
          if (hits.length >= limit) break;
        }
      }
      return { ok: true, value: hits };
    },
  });
}
