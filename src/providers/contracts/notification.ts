// NotificationProvider contract. Push + local notifications.
// Backed by an in-memory log in demo, by Expo Notifications in backend (P16).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface PushNotificationPayload {
  readonly title: string;
  readonly body: string;
  readonly data?: Readonly<Record<string, unknown>>;
}

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationProvider extends ProviderBase {
  readonly name: 'notification';
  requestPermission(): Promise<Result<PermissionStatus>>;
  scheduleLocal(payload: PushNotificationPayload, triggerSeconds: number): Promise<Result<string>>;
  cancelScheduled(notificationId: string): Promise<Result<void>>;
}
