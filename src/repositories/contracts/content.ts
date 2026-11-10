import type { Result } from '@/core/result';

import type { BaseEntity, ListQuery, PagedResult, ReadOnlyRepository } from '../types';

export interface ContentRecord extends BaseEntity {
  readonly slug: string;
  readonly titleKey: string;
  readonly bodyKey: string;
}

export interface ContentRepository extends ReadOnlyRepository<ContentRecord> {
  getBySlug(slug: string): Promise<Result<ContentRecord | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<ContentRecord>>>;
}
