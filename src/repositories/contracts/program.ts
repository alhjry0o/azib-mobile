import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type ProgramStatus = 'draft' | 'open' | 'closed' | 'archived';

/** P09.1 (D-2): additive optional taxonomy. Absent ⇒ 'grant'. */
export type ProgramKind = 'grant' | 'partial' | 'qard_hasan' | 'in_kind' | 'donor_contribution';

export interface Program extends BaseEntity {
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly status: ProgramStatus;
  readonly minAmount: number;
  readonly maxAmount: number;
  readonly currency: 'YER';
  readonly kind?: ProgramKind;
}

export interface CreateProgramInput {
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly status?: ProgramStatus;
  readonly minAmount: number;
  readonly maxAmount: number;
  readonly kind?: ProgramKind;
}

export interface UpdateProgramInput {
  readonly nameKey?: string;
  readonly descriptionKey?: string;
  readonly status?: ProgramStatus;
  readonly minAmount?: number;
  readonly maxAmount?: number;
  readonly kind?: ProgramKind;
}

export interface ProgramRepository {
  getById(id: string): Promise<Result<Program | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<Program>>>;
  create(input: CreateProgramInput): Promise<Result<Program>>;
  update(id: string, input: UpdateProgramInput): Promise<Result<Program>>;
  delete(id: string): Promise<Result<void>>;
}
