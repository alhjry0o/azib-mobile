// Generic in-memory CRUD mock factory.
// One implementation, six repositories. Avoids duplicating ~90 lines per repo.

import type { ZodType } from 'zod';

import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';

import type { BaseEntity, CrudRepository, ListQuery, PagedResult } from '../types';

export interface CrudFactoryOptions<T extends BaseEntity, TCreate, TUpdate> {
  /** Prefix for generated ids. */
  readonly idPrefix: string;
  readonly schemaCreate: ZodType<TCreate>;
  readonly schemaUpdate: ZodType<TUpdate>;
  readonly buildEntity: (args: { id: string; input: TCreate; nowIso: string }) => T;
  readonly applyUpdate: (args: { existing: T; patch: TUpdate; nowIso: string }) => T;
  readonly delayMs?: number;
  readonly forceErrorKind?: 'Network' | 'Unknown' | 'Validation' | null;
}

export function createMockCrudRepository<T extends BaseEntity, TCreate, TUpdate>(
  options: CrudFactoryOptions<T, TCreate, TUpdate>,
): CrudRepository<T, TCreate, TUpdate> {
  const { idPrefix, schemaCreate, schemaUpdate, buildEntity, applyUpdate } = options;
  const delayMs = options.delayMs ?? 0;
  const forceErrorKind = options.forceErrorKind ?? null;
  const byId = new Map<string, T>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) {
      return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    }
    return null;
  }

  const repo: CrudRepository<T, TCreate, TUpdate> = {
    async getById(id: string): Promise<Result<T | null>> {
      const failure = await simulate();
      if (failure) return { ok: false, error: failure };
      return ok(byId.get(id) ?? null);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<T>>> {
      const failure = await simulate();
      if (failure) return { ok: false, error: failure };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      const items = all.slice(offset, offset + limit);
      return ok({ items, total: all.length, limit, offset });
    },

    async create(input: TCreate): Promise<Result<T>> {
      const parsed = schemaCreate.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const failure = await simulate();
      if (failure) return { ok: false, error: failure };
      counter += 1;
      const id = `${idPrefix}-${Date.now()}-${counter}`;
      const entity = buildEntity({ id, input: parsed.data, nowIso: new Date().toISOString() });
      byId.set(id, entity);
      return ok(entity);
    },

    async update(id: string, patch: TUpdate): Promise<Result<T>> {
      const parsed = schemaUpdate.safeParse(patch);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const failure = await simulate();
      if (failure) return { ok: false, error: failure };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'NOT_FOUND' }) };
      }
      const updated = applyUpdate({ existing, patch: parsed.data, nowIso: new Date().toISOString() });
      byId.set(id, updated);
      return ok(updated);
    },

    async delete(id: string): Promise<Result<void>> {
      const failure = await simulate();
      if (failure) return { ok: false, error: failure };
      byId.delete(id);
      return ok(undefined);
    },
  };

  return repo;
}
