import type { Result } from '@/core/result';
import type { AppendOnlyRepository, BaseEntity, ListQuery, PagedResult } from '../types';

// P09.1 extends the union additively. 'pending'/'confirmed' stay readable.
// 'confirmed' (legacy) maps to paid_recorded — NOT to beneficiary confirmation.
export type DisbursementStatus =
  | 'pending'
  | 'confirmed'
  | 'proposed'
  | 'approved'
  | 'paid_recorded'
  | 'confirmed_by_beneficiary'
  | 'disputed'
  | 'rejected';

export type DisbursementActor = 'maker' | 'checker' | 'finance_officer' | 'beneficiary' | 'system';

export type DisbursementEvent =
  | { readonly type: 'approve'; readonly checkerId: string }
  | { readonly type: 'reject'; readonly checkerId: string; readonly reasonKey: string }
  | { readonly type: 'record_payment'; readonly providerReference: string }
  | { readonly type: 're_record_payment'; readonly providerReference: string }
  | { readonly type: 'beneficiary_confirm' }
  | { readonly type: 'beneficiary_dispute'; readonly note: string };

export interface Disbursement extends BaseEntity {
  readonly applicationId: string;
  readonly amount: number;
  readonly currency: 'YER';
  readonly status: DisbursementStatus;
  readonly providerReference: string | null;
  readonly makerId?: string | null;
  readonly checkerId?: string | null;
  readonly approvedAt?: string | null;
  readonly paidAt?: string | null;
  readonly beneficiaryConfirmedAt?: string | null;
  readonly rejectionReasonKey?: string | null;
  readonly disputeNote?: string | null;
}

export interface CreateDisbursementInput {
  readonly applicationId: string;
  readonly amount: number;
  readonly makerId?: string | null;
}

export interface DisbursementRepository
  extends AppendOnlyRepository<Disbursement, CreateDisbursementInput> {
  listByApplication(applicationId: string): Promise<Result<PagedResult<Disbursement>>>;
  list(query?: ListQuery): Promise<Result<PagedResult<Disbursement>>>;
  /** P09.1 — persistence only; the finance service enforces the machine. */
  advance(
    id: string,
    event: DisbursementEvent,
    actor: DisbursementActor,
  ): Promise<Result<Disbursement>>;
}
