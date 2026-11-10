// In-memory PaymentProvider. Compliant with ADR-0005 (Non-Custodial).
// No method moves money. recordPledge stores an intent only.
// verifyExternalPayment returns null ALWAYS — no fake confirmation.

import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type { DonationPledge, PaymentProvider, PledgeRecord } from '../contracts/payment';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

export interface MockPaymentProvider extends PaymentProvider {
  __pledges(): readonly PledgeRecord[];
}

export function createMockPaymentProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): MockPaymentProvider {
  const pledges = new Map<string, PledgeRecord>();

  return Object.freeze({
    name: 'payment' as const,
    mode: 'mock' as const,
    capabilities: ['recordPledge', 'verifyExternalPayment'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async recordPledge(pledge: DonationPledge): Promise<Result<PledgeRecord>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      if (pledge.amount <= 0) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_AMOUNT' }) };
      }
      const id = `mock-pledge-${stableHash(JSON.stringify(pledge) + Date.now())}`;
      const record: PledgeRecord = Object.freeze({
        id,
        amount: pledge.amount,
        currency: 'YER' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dataOrigin: 'demo' as const,
      });
      pledges.set(id, record);
      return { ok: true, value: record };
    },
    async verifyExternalPayment(): Promise<Result<PledgeRecord | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return { ok: true, value: null };
    },
    __pledges(): readonly PledgeRecord[] {
      return Array.from(pledges.values());
    },
  });
}
