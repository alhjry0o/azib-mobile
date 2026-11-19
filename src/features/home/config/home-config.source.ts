// Swappable configuration source. Mock today; a SettingsRepository-backed
// source can replace it via setHomeConfigSource() without touching consumers.
import type { Result } from '@/core/result';
import { DEFAULT_HOME_CONFIG } from './default-home-config';
import type { HomeConfig, HomeConfigSource } from './home-config.types';

export function createMockHomeConfigSource(): HomeConfigSource {
  return Object.freeze({
    id: 'mock',
    async load(): Promise<Result<HomeConfig>> {
      return { ok: true, value: DEFAULT_HOME_CONFIG };
    },
  });
}

let activeSource: HomeConfigSource = createMockHomeConfigSource();

export function getHomeConfigSource(): HomeConfigSource {
  return activeSource;
}

export function setHomeConfigSource(source: HomeConfigSource): void {
  activeSource = source;
}

export function resetHomeConfigSource(): void {
  activeSource = createMockHomeConfigSource();
}
