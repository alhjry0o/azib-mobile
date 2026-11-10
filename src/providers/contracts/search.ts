// SearchProvider contract. Backed by a simple substring search in demo, by Postgres FTS in backend (P16).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface SearchHit<T = Record<string, unknown>> {
  readonly id: string;
  readonly score: number;
  readonly item: T;
}

export interface SearchQuery {
  readonly text: string;
  readonly limit?: number;
  readonly scope?: string;
}

export interface SearchProvider extends ProviderBase {
  readonly name: 'search';
  query<T = Record<string, unknown>>(query: SearchQuery): Promise<Result<SearchHit<T>[]>>;
}
