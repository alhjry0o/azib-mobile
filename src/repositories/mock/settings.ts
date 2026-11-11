import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import { SettingsValueSchema } from '@/schemas/settings';

import type { Settings, SettingsRepository } from '../contracts/settings';
import type { MockRepositoryOptions } from './profile';

export function createMockSettingsRepository(
  options: MockRepositoryOptions = {},
): SettingsRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const map = new Map<string, Settings>();

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
    }
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  return Object.freeze({
    async get(key: string): Promise<Result<Settings | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(map.get(key) ?? null);
    },

    async update(
      key: string,
      value: Readonly<Record<string, unknown>>,
    ): Promise<Result<Settings>> {
      const parsed = SettingsValueSchema.safeParse(value);
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const record: Settings = Object.freeze({
        key,
        value: Object.freeze(parsed.data),
        updatedAt: new Date().toISOString(),
      });
      map.set(key, record);
      return ok(record);
    },
  });
}
