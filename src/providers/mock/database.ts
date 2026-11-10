// Marker DatabaseProvider for demo mode. No methods beyond ProviderBase.

import type { DatabaseProvider } from '../contracts/database';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, type MockProviderConfig } from './config';

export function createMockDatabaseProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): DatabaseProvider {
  return Object.freeze({
    name: 'database' as const,
    mode: 'mock' as const,
    capabilities: [] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      const failure = await simulateMockIO(config);
      if (failure) return { status: 'unavailable', message: 'mock failure', checkedAt: Date.now() };
      return { status: 'ok', checkedAt: Date.now() };
    },
  });
}
