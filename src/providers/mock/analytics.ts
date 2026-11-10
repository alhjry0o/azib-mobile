// In-memory AnalyticsProvider. No-op by default; logs events for tests.
// Enforces ADR-0005-style PII discipline: never include emails, phones, tokens.

import type { Result } from '@/core/result';

import type { AnalyticsEvent, AnalyticsProvider } from '../contracts/analytics';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, type MockProviderConfig } from './config';

export interface MockAnalyticsProvider extends AnalyticsProvider {
  __events(): readonly AnalyticsEvent[];
  __userId(): string | null;
}

export function createMockAnalyticsProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): MockAnalyticsProvider {
  const events: AnalyticsEvent[] = [];
  let userId: string | null = null;

  return Object.freeze({
    name: 'analytics' as const,
    mode: 'mock' as const,
    capabilities: ['track', 'setUserId'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async track(event: AnalyticsEvent): Promise<Result<void>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      events.push(event);
      return { ok: true, value: undefined };
    },
    async setUserId(id: string | null): Promise<Result<void>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      userId = id;
      return { ok: true, value: undefined };
    },
    __events(): readonly AnalyticsEvent[] {
      return events;
    },
    __userId(): string | null {
      return userId;
    },
  });
}
