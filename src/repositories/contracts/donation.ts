import type { Result } from '@/core/result';
import type { AppendOnlyRepository, BaseEntity, ListQuery, PagedResult } from '../types';

// P09.1 extends the union additively. 'pending' and 'confirmed' remain valid
// legacy values (read-only aliases) so P03 contract tests keep passing.
// 'confirmed' NEVER implies 'verified' — verification is a separate stage.
export type DonationStatus =
  | 'pending'
  | 'confirmed'
  | 'declined'
  | 'intent_created'
  | 'provider_pending'
  | 'provider_confirmed'
  | 'verified'
  | 'cancelled';

/** Workflow actor. The client may only ever act as 'donor'. */
export type DonationActor = 'donor' | 'provider' | 'finance_officer' | 'system';

export type DonationEvent =
  | { readonly type: 'handoff'; readonly providerReference: string }
  | { readonly type: 'provider_confirm'; readonly providerReference: string }
  | { readonly type: 'provider_decline' }
  | { readonly type: 'verify'; readonly verifiedBy: string; readonly receiptNumber: string }
  | { readonly type: 'verification_decline'; readonly verifiedBy: string }
  | { readonly type: 'cancel' };

export interface Donation extends BaseEntity {
  readonly donorId: string;
  readonly amount: number;
  readonly currency: 'YER';
  readonly status: DonationStatus;
  readonly note: string | null;
  readonly programId?: string | null;
  /** Hides the donor from public/report surfaces. */
  readonly anonymous?: boolean;
  /** Same key + same donor ⇒ the same intent (no duplicate). */
  readonly idempotencyKey?: string | null;
  readonly providerReference?: string | null;
  /** Minted ONLY when the donation reaches 'verified'. */
  readonly receiptNumber?: string | null;
  readonly verifiedAt?: string | null;
  readonly verifiedBy?: string | null;
}

export interface CreateDonationInput {
  readonly donorId: string;
  readonly amount: number;
  readonly note?: string | null;
  readonly programId?: string | null;
  readonly anonymous?: boolean;
  readonly idempotencyKey?: string | null;
}

export interface DonationRepository extends AppendOnlyRepository<Donation, CreateDonationInput> {
  listByDonor(donorId: string): Promise<Result<PagedResult<Donation>>>;
  list(query?: ListQuery): Promise<Result<PagedResult<Donation>>>;
  /**
   * P09.1 — applies a lifecycle event. Persistence only: the transition is
   * validated by the finance service through the pure machine (ADR-0027).
   */
  advance(id: string, event: DonationEvent, actor: DonationActor): Promise<Result<Donation>>;
}
