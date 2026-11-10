import type { Result } from '@/core/result';

import type { AppendOnlyRepository, BaseEntity, ListQuery, PagedResult } from '../types';

export interface Disbursement extends BaseEntity {
  readonly applicationId: string;
  readonly amount: number;
  readonly currency: 'YER';
  readonly status: 'pending' | 'confirmed';
  readonly providerReference: string | null;
}

export interface CreateDisbursementInput {
  readonly applicationId: string;
  readonly amount: number;
}

export interface DisbursementRepository
  extends AppendOnlyRepository<Disbursement, CreateDisbursementInput> {
  listByApplication(applicationId: string): Promise<Result<PagedResult<Disbursement>>>;
  list(query?: ListQuery): Promise<Result<PagedResult<Disbursement>>>;
  }
