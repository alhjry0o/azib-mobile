// The ONLY source of the Verified crown (D-3). Append-oriented: a decision
// creates a new state on the record; documents are never exposed to ambassadors.
import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface PartnerVerification extends BaseEntity {
  readonly partnerId: string;
  readonly submittedBy: string;
  readonly status: VerificationStatus;
  /** Private: shop photo / licence. Reviewer-only. */
  readonly documentFileIds: readonly string[];
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly reasonKey?: string | null;
  /** Periodic re-verification deadline. Null means open-ended. */
  readonly validUntil?: string | null;
}

export interface SubmitVerificationInput {
  readonly partnerId: string;
  readonly submittedBy: string;
  readonly documentFileIds: readonly string[];
}

export interface DecideVerificationInput {
  readonly decision: 'verified' | 'rejected' | 'expired';
  readonly decidedBy: string;
  readonly reasonKey?: string | null;
  readonly validUntil?: string | null;
}

export interface PartnerVerificationRepository {
  getById(id: string): Promise<Result<PartnerVerification | null>>;
  getLatest(partnerId: string): Promise<Result<PartnerVerification | null>>;
  listByPartner(partnerId: string): Promise<Result<readonly PartnerVerification[]>>;
  list(query?: ListQuery): Promise<Result<PagedResult<PartnerVerification>>>;
  submit(input: SubmitVerificationInput): Promise<Result<PartnerVerification>>;
  decide(id: string, input: DecideVerificationInput): Promise<Result<PartnerVerification>>;
}
