// Demo Payment Provider (D-1). Compliant with ADR-0005 (Non-Custodial):
// the CONTRACT is unchanged — no charge/capture/refund/createIntent, and no
// card field anywhere. Demo-only lifecycle helpers are prefixed `__`.
//
// verifyExternalPayment never invents a confirmation: it returns a pledge
// ONLY when the demo lifecycle already marked it confirmed, else null.
// Every record carries dataOrigin='demo' and never enters impact reports.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { DonationPledge, PaymentProvider, PledgeRecord } from '../contracts/payment';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

export interface DemoPaymentProvider extends PaymentProvider {
  __pledges(): readonly PledgeRecord[];
  /** Demo-only: represents the licensed provider's confirmation callback. */
  __confirmPledge(id: string): Promise<Result<PledgeRecord>>;
  __declinePledge(id: string): Promise<Result<PledgeRecord>>;
}

export function isDemoPaymentProvider(provider: PaymentProvider): provider is DemoPaymentProvider {
  return (
    provider.mode === 'mock' &&
    typeof (provider as unknown as Record<string, unknown>).__confirmPledge === 'function'
  );
}

export function createDemoPaymentProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): DemoPaymentProvider {
  const pledges = new Map<string, PledgeRecord>();

  function transition(id: string, status: PledgeRecord['status']): Result<PledgeRecord> {
    const existing = pledges.get(id);
    if (!existing) {
      return { ok: false, error: AppError.notFound({ code: 'PLEDGE_NOT_FOUND' }) };
    }
    if (existing.status !== 'pending') {
      return { ok: false, error: AppError.conflict({ code: 'PLEDGE_ALREADY_SETTLED' }) };
    }
    const next: PledgeRecord = Object.freeze({ ...existing, status });
    pledges.set(id, next);
    return ok(next);
  }

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
      if (!Number.isInteger(pledge.amount) || pledge.amount <= 0) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_AMOUNT' }) };
      }
      const id = `demo-pledge-${stableHash(`${pledge.amount}:${Date.now()}:${pledges.size}`)}`;
      const record: PledgeRecord = Object.freeze({
        id,
        amount: pledge.amount,
        currency: 'YER' as const,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        dataOrigin: 'demo' as const,
      });
      pledges.set(id, record);
      return ok(record);
    },

    async verifyExternalPayment(
      providerReference: string,
    ): Promise<Result<PledgeRecord | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const found = pledges.get(providerReference);
      if (!found || found.status !== 'confirmed') return ok(null);
      return ok(found);
    },

    __pledges(): readonly PledgeRecord[] {
      return Array.from(pledges.values());
    },

    async __confirmPledge(id: string): Promise<Result<PledgeRecord>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return transition(id, 'confirmed');
    },

    async __declinePledge(id: string): Promise<Result<PledgeRecord>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return transition(id, 'declined');
    },
  });
}
