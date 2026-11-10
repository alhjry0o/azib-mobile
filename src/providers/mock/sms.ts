// In-memory SmsProvider. Does not send real SMS.

import type { Result } from '@/core/result';

import type { SmsMessage, SmsProvider } from '../contracts/sms';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

export interface MockSmsProvider extends SmsProvider {
  __sent(): readonly SmsMessage[];
}

export function createMockSmsProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): MockSmsProvider {
  const sent: SmsMessage[] = [];

  return Object.freeze({
    name: 'sms' as const,
    mode: 'mock' as const,
    capabilities: ['send'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async send(message: SmsMessage): Promise<Result<{ id: string }>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      sent.push(message);
      const id = `mock-sms-${stableHash(message.to + Date.now())}`;
      return { ok: true, value: { id } };
    },
    __sent(): readonly SmsMessage[] {
      return sent;
    },
  });
}
