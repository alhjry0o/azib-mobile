import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type SoukReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type SoukReportTargetKind = 'item' | 'chat_message';

export interface SoukReport extends BaseEntity {
  readonly itemId: string;
  readonly targetKind: SoukReportTargetKind;
  readonly targetId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
  readonly status: SoukReportStatus;
  readonly resolvedBy?: string | null;
  readonly resolvedAt?: string | null;
  readonly resolutionKey?: string | null;
}

export interface CreateSoukReportInput {
  readonly itemId: string;
  readonly targetKind: SoukReportTargetKind;
  readonly targetId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
}

export interface SoukReportRepository {
  getById(id: string): Promise<Result<SoukReport | null>>;
  listByItem(itemId: string): Promise<Result<readonly SoukReport[]>>;
  list(query?: ListQuery): Promise<Result<PagedResult<SoukReport>>>;
  create(input: CreateSoukReportInput): Promise<Result<SoukReport>>;
  updateStatus(
    id: string,
    status: SoukReportStatus,
    actorId: string,
    resolutionKey?: string | null,
  ): Promise<Result<SoukReport>>;
}
