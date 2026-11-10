// In-memory EmailProvider. Does not send real emails.
// Keeps a log of sent messages for tests; console.log output is redacted by logger.

import type { Result } from '@/core/result';

import type { EmailMessage, EmailProvider } from '../contracts/email';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

export interface MockEmailProvider extends EmailProvider {
  __sent(): readonly EmailMessage[];
}

export function createMockEmailProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): MockEmailProvider {
  const sent: EmailMessage[] = [];

  return Object.freeze({
    name: 'email' as const,
    mode: 'mock' as const,
    capabilities: ['send'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async send(message: EmailMessage): Promise<Result<{ id: string }>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      sent.push(message);
      const id = `mock-email-${stableHash(message.to + Date.now())}`;
      return { ok: true, value: { id } };
    },
    __sent(): readonly EmailMessage[] {
      return sent;
    },
  });
}
