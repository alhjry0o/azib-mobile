import type { Result } from '@/core/result';

export type DataOrigin = 'demo' | 'real';

export interface BaseEntity {
  readonly id: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly dataOrigin: DataOrigin;
}

export interface ListQuery {
  readonly limit?: number;
  readonly offset?: number;
}

export interface PagedResult<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface CrudRepository<T, TCreate, TUpdate> {
  getById(id: string): Promise<Result<T | null>>;
  create(input: TCreate): Promise<Result<T>>;
  update(id: string, input: TUpdate): Promise<Result<T>>;
  delete(id: string): Promise<Result<void>>;
  list(query?: ListQuery): Promise<Result<PagedResult<T>>>;
}

export interface ReadOnlyRepository<T> {
  getById(id: string): Promise<Result<T | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<T>>>;
}

export interface AppendOnlyRepository<T, TCreate> {
  getById(id: string): Promise<Result<T | null>>;
  create(input: TCreate): Promise<Result<T>>;
  list(query?: ListQuery): Promise<Result<PagedResult<T>>>;
}
