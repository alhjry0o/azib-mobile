import type { Result } from '@/core/result';

import type { BaseEntity, ListQuery, PagedResult } from '../types';

export interface AuditEntry extends BaseEntity {
  readonly actorId: string;
  readonly action: string;
  readonly target: string;
  readonly meta: Readonly<Record<string, unknown>>;
}

export interface CreateAuditEntryInput {
  readonly actorId: string;
  readonly action: string;
  readonly target: string;
  readonly meta?: Readonly<Record<string, unknown>>;
}

/** Append-only: no update, no delete. Entries are immutable for compliance. */
export interface AuditRepository {
  getById(id: string): Promise<Result<AuditEntry | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<AuditEntry>>>;
  append(input: CreateAuditEntryInput): Promise<Result<AuditEntry>>;
}
