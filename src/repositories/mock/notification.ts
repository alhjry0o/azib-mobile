import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { CreateInAppNotificationInputSchema } from '@/schemas/notification';
import type {
  CreateInAppNotificationInput,
  InAppNotification,
  NotificationRepository,
} from '../contracts/notification';
import type { ListQuery, PagedResult } from '../types';
import type { MockRepositoryOptions } from './profile';

export function createMockNotificationRepository(
  options: MockRepositoryOptions = {},
  seed: readonly InAppNotification[] = [],
): NotificationRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const byId = new Map<string, InAppNotification>();
  for (const record of seed) byId.set(record.id, record);
  let counter = 0;

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

    async create(input: CreateInAppNotificationInput): Promise<Result<InAppNotification>> {
      const parsed = CreateInAppNotificationInputSchema.safeParse(input);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      counter += 1;
      const id = `mock-notification-${Date.now()}-${counter}`;
      const now = new Date().toISOString();
      const record: InAppNotification = Object.freeze({
        id,
        userId: parsed.data.userId,
        titleKey: parsed.data.titleKey,
        bodyKey: parsed.data.bodyKey,
        read: false,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      byId.set(id, record);
      return ok(record);
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
