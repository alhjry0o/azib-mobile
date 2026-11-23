const DAY_MS = 24 * 60 * 60 * 1000;

/** PENDING_POLICY — provisional 30-day chat retention (PRODUCT_POLICIES #7). */
export const CHAT_RETENTION_DAYS = 30;

export interface RetainedMessage {
  readonly id: string;
  readonly createdAt: string;
}

export function retentionCutoff(now: Date, days: number = CHAT_RETENTION_DAYS): string {
  return new Date(now.getTime() - days * DAY_MS).toISOString();
}

export function isExpired(
  createdAt: string,
  now: Date,
  days: number = CHAT_RETENTION_DAYS,
): boolean {
  const stamp = Date.parse(createdAt);
  if (Number.isNaN(stamp)) return true;
  return stamp < now.getTime() - days * DAY_MS;
}

export function filterRetained<T extends RetainedMessage>(
  messages: readonly T[],
  now: Date,
  days: number = CHAT_RETENTION_DAYS,
): readonly T[] {
  return messages.filter((message) => !isExpired(message.createdAt, now, days));
}
