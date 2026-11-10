import type { Result } from '@/core/result';

import type { ListQuery } from '../types';

export interface SearchRepository {
  /** Delegates to the SearchProvider. Kept as a repo for feature-level composition. */
  search<T = Record<string, unknown>>(
    text: string,
    query?: ListQuery,
  ): Promise<Result<readonly T[]>>;
}
