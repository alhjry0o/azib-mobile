import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import {
  CreateProgramInputSchema,
  UpdateProgramInputSchema,
} from '@/schemas/program';

import type {
  CreateProgramInput,
  Program,
  ProgramRepository,
  UpdateProgramInput,
} from '../contracts/program';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockProgramRepository(
  options: MockRepositoryOptions = {},
): ProgramRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, Program>();

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<Program | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<Program>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      const items = all.slice(offset, offset + limit);
      return ok({ items, total: all.length, limit, offset });
    },

    async create(input: CreateProgramInput): Promise<Result<Program>> {
      const parsed = CreateProgramInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const id = `mock-program-${Date.now()}-${byId.size}`;
      const now = new Date().toISOString();
      const program: Program = Object.freeze({
        id,
        nameKey: parsed.data.nameKey,
        descriptionKey: parsed.data.descriptionKey,
        status: parsed.data.status,
        minAmount: parsed.data.minAmount,
        maxAmount: parsed.data.maxAmount,
        currency: 'YER' as const,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(id, program);
      return ok(program);
    },

    async update(id: string, input: UpdateProgramInput): Promise<Result<Program>> {
      const parsed = UpdateProgramInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'PROGRAM_NOT_FOUND' }) };
      }
      const updated: Program = Object.freeze({
        ...existing,
        ...(parsed.data.nameKey !== undefined && { nameKey: parsed.data.nameKey }),
        ...(parsed.data.descriptionKey !== undefined && {
          descriptionKey: parsed.data.descriptionKey,
        }),
        ...(parsed.data.status !== undefined && { status: parsed.data.status }),
        ...(parsed.data.minAmount !== undefined && { minAmount: parsed.data.minAmount }),
        ...(parsed.data.maxAmount !== undefined && { maxAmount: parsed.data.maxAmount }),
        updatedAt: new Date().toISOString(),
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
  });
}
