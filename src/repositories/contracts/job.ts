import type { CrudRepository, BaseEntity } from '../types';

export interface Job extends BaseEntity {
  readonly titleKey: string;
  readonly partnerId: string;
  readonly status: 'draft' | 'open' | 'closed';
}

export interface CreateJobInput {
  readonly titleKey: string;
  readonly partnerId: string;
}

export interface UpdateJobInput {
  readonly titleKey?: string;
  readonly status?: Job['status'];
}

export type JobRepository = CrudRepository<Job, CreateJobInput, UpdateJobInput>;
