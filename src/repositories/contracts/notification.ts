import type { Result } from '@/core/result';

import type { BaseEntity, ListQuery, PagedResult } from '../types';

export interface InAppNotification extends BaseEntity {
  readonly userId: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly read: boolean;
}

export interface NotificationRepository {
  getById(id: string): Promise<Result<InAppNotification | null>>;
  list(query?: ListQuery): Promise<Result<PagedResult<InAppNotification>>>;
  markRead(id: string): Promise<Result<InAppNotification>>;
  delete(id: string): Promise<Result<void>>;
}
