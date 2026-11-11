import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';

import type { InAppNotification, NotificationRepository } from '../contracts/notification';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockNotificationRepository(
  options: MockRepositoryOptions = {},
  seed: readonly InAppNotification[] = [],
): NotificationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, InAppNotification>();
  for (const record of seed) byId.set(record.id, record);

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async getById(id: string): Promise<Result<InAppNotification | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(byId.get(id) ?? null);
    },

    async list(query?: ListQuery): Promise<Result<PagedResult<InAppNotification>>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const limit = query?.limit ?? 20;
      const offset = query?.offset ?? 0;
      const all = Array.from(byId.values());
      const items = all.slice(offset, offset + limit);
      return ok({ items, total: all.length, limit, offset });
    },

    async markRead(id: string): Promise<Result<InAppNotification>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = byId.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'NOTIFICATION_NOT_FOUND' }) };
      }
      const updated: InAppNotification = Object.freeze({
        ...existing,
        read: true,
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
