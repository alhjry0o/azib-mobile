import type { Result } from '@/core/result';

export interface Settings {
  readonly key: string;
  readonly value: Readonly<Record<string, unknown>>;
  readonly updatedAt: string;
}

export interface SettingsRepository {
  get(key: string): Promise<Result<Settings | null>>;
  update(key: string, value: Readonly<Record<string, unknown>>): Promise<Result<Settings>>;
}
