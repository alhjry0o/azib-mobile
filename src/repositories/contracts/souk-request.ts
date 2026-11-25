import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type SoukRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'handed_over';

export interface SoukRequest extends BaseEntity {
  readonly itemId: string;
  readonly requesterId: string;
  readonly reason: string;
  readonly status: SoukRequestStatus;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly reasonKey?: string | null;
  /** Demo-labelled handover code. Visible to the two parties only. */
  readonly handoverCode?: string | null;
  readonly donorContactConsent: boolean;
  readonly recipientContactConsent: boolean;
  readonly donorConfirmedAt?: string | null;
  readonly recipientConfirmedAt?: string | null;
  readonly handedOverAt?: string | null;
  /** Staff-private experience rating. Never public, never a moral score. */
  readonly rating?: number | null;
  readonly ratingNote?: string | null;
  readonly ratedBy?: string | null;
  readonly ratedAt?: string | null;
}

export interface CreateSoukRequestInput {
  readonly itemId: string;
  readonly requesterId: string;
  readonly reason: string;
}

export interface UpdateSoukRequestInput {
  readonly status?: SoukRequestStatus;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
  readonly reasonKey?: string | null;
  readonly handoverCode?: string | null;
  readonly donorContactConsent?: boolean;
  readonly recipientContactConsent?: boolean;
  readonly donorConfirmedAt?: string | null;
  readonly recipientConfirmedAt?: string | null;
  readonly handedOverAt?: string | null;
  readonly rating?: number | null;
  readonly ratingNote?: string | null;
  readonly ratedBy?: string | null;
  readonly ratedAt?: string | null;
}

export interface SoukRequestRepository {
  getById(id: string): Promise<Result<SoukRequest | null>>;
  listByItem(itemId: string): Promise<Result<readonly SoukRequest[]>>;
  listByRequester(requesterId: string): Promise<Result<readonly SoukRequest[]>>;
  list(query?: ListQuery): Promise<Result<PagedResult<SoukRequest>>>;
  create(input: CreateSoukRequestInput): Promise<Result<SoukRequest>>;
  update(id: string, input: UpdateSoukRequestInput): Promise<Result<SoukRequest>>;
}
