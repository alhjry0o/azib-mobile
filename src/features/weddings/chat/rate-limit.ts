export interface RateLimitConfig {
  readonly maxMessages: number;
  readonly windowMs: number;
}

/** PENDING_POLICY — provisional 5 messages / 10 seconds. */
export const DEFAULT_CHAT_RATE: RateLimitConfig = Object.freeze({
  maxMessages: 5,
  windowMs: 10_000,
});

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly recentCount: number;
  readonly retryAfterMs: number;
  readonly reasonKey: string | null;
}

export function checkChatRate(
  timestamps: readonly number[],
  now: number,
  config: RateLimitConfig = DEFAULT_CHAT_RATE,
): RateLimitResult {
  const windowStart = now - config.windowMs;
  const recent = timestamps.filter((stamp) => stamp > windowStart && stamp <= now);
  if (recent.length < config.maxMessages) {
    return { allowed: true, recentCount: recent.length, retryAfterMs: 0, reasonKey: null };
  }
  const oldest = recent.reduce((min, stamp) => (stamp < min ? stamp : min), now);
  return {
    allowed: false,
    recentCount: recent.length,
    retryAfterMs: Math.max(0, oldest + config.windowMs - now),
    reasonKey: 'weddings:chat.blocked.rate',
  };
}
