import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type OfferReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface OfferReport extends BaseEntity {
  readonly offerId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
  readonly status: OfferReportStatus;
  readonly resolvedBy?: string | null;
  readonly resolvedAt?: string | null;
  readonly resolutionKey?: string | null;
}

export interface CreateOfferReportInput {
  readonly offerId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
}

export interface OfferReportRepository {
  getById(id: string): Promise<Result<OfferReport | null>>;
  listByOffer(offerId: string): Promise<Result<readonly OfferReport[]>>;
  list(query?: ListQuery): Promise<Result<PagedResult<OfferReport>>>;
  create(input: CreateOfferReportInput): Promise<Result<OfferReport>>;
  updateStatus(
    id: string,
    status: OfferReportStatus,
    actorId: string,
    resolutionKey?: string | null,
  ): Promise<Result<OfferReport>>;
}
