import type { CrudRepository, BaseEntity } from '../types';

export interface Wedding extends BaseEntity {
  readonly titleKey: string;
  readonly scheduledDate: string;
  readonly capacity: number;
  readonly status: 'draft' | 'open' | 'closed' | 'completed';
}

export interface CreateWeddingInput {
  readonly titleKey: string;
  readonly scheduledDate: string;
  readonly capacity: number;
}

export interface UpdateWeddingInput {
  readonly titleKey?: string;
  readonly scheduledDate?: string;
  readonly capacity?: number;
  readonly status?: Wedding['status'];
}

export type WeddingRepository = CrudRepository<Wedding, CreateWeddingInput, UpdateWeddingInput>;
