import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { CreateAuditEntryInputSchema } from '@/schemas/audit';

import type { AuditEntry, AuditRepository, CreateAuditEntryInput } from '../contracts/audit';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockAuditRepository(
  options: MockRepositoryOptions = {},
): AuditRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, AuditEntry>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<AuditEntry | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async append(input: CreateAuditEntryInput): Promise<Result<AuditEntry>> {
      const parsed = CreateAuditEntryInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const id = `mock-audit-${Date.now()}-${counter}`;
      const now = new Date().toISOString();
      const entry: AuditEntry = Object.freeze({
        id,
        actorId: parsed.data.actorId,
        action: parsed.data.action,
        target: parsed.data.target,
        meta: Object.freeze(parsed.data.meta ?? {}),
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(id, entry);
      return ok(entry);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<AuditEntry>>> {
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
