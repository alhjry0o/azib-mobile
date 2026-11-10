import type { Result } from '@/core/result';

import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'disbursed';

export interface Application extends BaseEntity {
  readonly applicantId: string;
  readonly programId: string;
  readonly status: ApplicationStatus;
  readonly requestedAmount: number;
  readonly currency: 'YER';
  readonly notes: string | null;
  readonly reviewerNote: string | null;
}

export interface CreateApplicationInput {
  readonly applicantId: string;
  readonly programId: string;
  readonly requestedAmount: number;
  readonly notes?: string | null;
}

export interface ApplicationListQuery extends ListQuery {
  readonly status?: ApplicationStatus;
  readonly programId?: string;
  readonly applicantId?: string;
}

export interface ApplicationRepository {
  getById(id: string): Promise<Result<Application | null>>;
  list(query?: ApplicationListQuery): Promise<Result<PagedResult<Application>>>;
  listByApplicant(applicantId: string): Promise<Result<readonly Application[]>>;
  create(input: CreateApplicationInput): Promise<Result<Application>>;
  updateStatus(
    id: string,
    status: ApplicationStatus,
    reviewerNote?: string,
  ): Promise<Result<Application>>;
  delete(id: string): Promise<Result<void>>;
}
