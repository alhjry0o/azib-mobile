import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export interface InAppNotification extends BaseEntity {
  readonly userId: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly read: boolean;
}

/** P10.1 — additive: in-app notifications can now be created. */
export interface CreateInAppNotificationInput {
  readonly userId: string;
  readonly titleKey: string;
  readonly bodyKey: string;
}

export interface NotificationRepository {
  getById(id: string): Promise<Result<InAppNotification | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<InAppNotification>>>;
  create(input: CreateInAppNotificationInput): Promise<Result<InAppNotification>>;
  markRead(id: string): Promise<Result<InAppNotification>>;
  delete(id: string): Promise<Result<void>>;
}
