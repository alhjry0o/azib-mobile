// PaymentProvider contract. Compliant with ADR-0005 (Non-Custodial).
//
// FORBIDDEN in this interface (enforced by absence):
//   - charge(), capture(), refund(), createIntent(), createPaymentMethod()
//   - any method that touches card data, IBAN, or wallet balances.
//
// ALLOWED:
//   - recordPledge(): register an intent to donate (no money moves in-app).
//   - verifyExternalPayment(): verify a reference issued by a licensed external provider (P09).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface DonationPledge {
  readonly amount: number;
  readonly currency: 'YER';
  readonly note?: string;
}

export type PledgeStatus = 'pending' | 'confirmed' | 'declined';

export interface PledgeRecord {
  readonly id: string;
  readonly amount: number;
  readonly currency: 'YER';
  readonly status: PledgeStatus;
  /** ISO 8601. */
  readonly createdAt: string;
  readonly dataOrigin: 'real' | 'demo';
}

export interface PaymentProvider extends ProviderBase {
  readonly name: 'payment';
  recordPledge(pledge: DonationPledge): Promise<Result<PledgeRecord>>;
  verifyExternalPayment(providerReference: string): Promise<Result<PledgeRecord | null>>;
}
