import type { Result } from '@/core/result';

import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type ProgramStatus = 'draft' | 'open' | 'closed' | 'archived';

export interface Program extends BaseEntity {
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly status: ProgramStatus;
  readonly minAmount: number;
  readonly maxAmount: number;
  readonly currency: 'YER';
}

export interface CreateProgramInput {
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly status?: ProgramStatus;
  readonly minAmount: number;
  readonly maxAmount: number;
}

export interface UpdateProgramInput {
  readonly nameKey?: string;
  readonly descriptionKey?: string;
  readonly status?: ProgramStatus;
  readonly minAmount?: number;
  readonly maxAmount?: number;
}

export interface ProgramRepository {
  getById(id: string): Promise<Result<Program | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<Program>>>;
  create(input: CreateProgramInput): Promise<Result<Program>>;
  update(id: string, input: UpdateProgramInput): Promise<Result<Program>>;
  delete(id: string): Promise<Result<void>>;
}
