import type { Result } from '@/core/result';

import type { AppendOnlyRepository, BaseEntity, ListQuery, PagedResult } from '../types';

export interface Donation extends BaseEntity {
  readonly donorId: string;
  readonly amount: number;
  readonly currency: 'YER';
  readonly status: 'pending' | 'confirmed' | 'declined';
  readonly note: string | null;
}

export interface CreateDonationInput {
  readonly donorId: string;
  readonly amount: number;
  readonly note?: string | null;
}

export interface DonationRepository extends AppendOnlyRepository<Donation, CreateDonationInput> {
  listByDonor(donorId: string): Promise<Result<PagedResult<Donation>>>;
  list(query?: ListQuery): Promise<Result<PagedResult<Donation>>>;
}
