// In-app notifications only. Push arrives in P16; nothing here claims otherwise.
import type { NotificationRepository } from '@/repositories/contracts/notification';

export type WeddingNotificationKind = 'invite' | 'joinApproved' | 'joinRejected' | 'poll';

export async function notifyWedding(
  notifications: NotificationRepository,
  userId: string,
  kind: WeddingNotificationKind,
): Promise<void> {
  if (!userId) return;
  await notifications.create({
    userId,
    titleKey: `weddings:notifications.${kind}.title`,
    bodyKey: `weddings:notifications.${kind}.body`,
  });
}
