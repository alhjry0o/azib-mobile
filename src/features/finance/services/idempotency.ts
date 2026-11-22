// Deterministic idempotency key for donation intents (P09.2).
// Pure: same inputs ⇒ same key ⇒ the same intent (no duplicate on retry).
// Changing the amount or anonymity legitimately produces a NEW intent.
export function buildIdempotencyKey(input: {
  readonly donorId: string;
  readonly programId: string;
  readonly amount: number;
  readonly anonymous: boolean;
}): string {
  const amount = Number.isFinite(input.amount) ? Math.floor(input.amount) : 0;
  return `intent:${input.donorId}:${input.programId}:${amount}:${input.anonymous ? 1 : 0}`;
}
