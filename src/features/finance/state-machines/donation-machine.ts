// Pure donation lifecycle (P09.1). Four separated stages:
// intent_created → provider_pending → provider_confirmed → verified.
// The client may only create an intent and cancel it before handoff.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { DonationActor, DonationStatus } from '@/repositories/contracts/donation';

export const DONATION_STATUSES = [
  'intent_created',
  'provider_pending',
  'provider_confirmed',
  'verified',
  'declined',
  'cancelled',
] as const;
export type DonationWorkflowStatus = (typeof DONATION_STATUSES)[number];

export interface DonationTransition {
  readonly from: DonationWorkflowStatus;
  readonly to: DonationWorkflowStatus;
  readonly actor: DonationActor;
}

export const DONATION_TRANSITIONS: readonly DonationTransition[] = Object.freeze([
  Object.freeze({ from: 'intent_created', to: 'provider_pending', actor: 'provider' }),
  Object.freeze({ from: 'intent_created', to: 'cancelled', actor: 'donor' }),
  Object.freeze({ from: 'provider_pending', to: 'provider_confirmed', actor: 'provider' }),
  Object.freeze({ from: 'provider_pending', to: 'declined', actor: 'provider' }),
  Object.freeze({ from: 'provider_confirmed', to: 'verified', actor: 'finance_officer' }),
  Object.freeze({ from: 'provider_confirmed', to: 'declined', actor: 'finance_officer' }),
] as const);

const TERMINAL: readonly DonationWorkflowStatus[] = ['verified', 'declined', 'cancelled'];

/** Statuses the client is allowed to write at all. */
export const CLIENT_WRITABLE_DONATION_STATUSES: readonly DonationWorkflowStatus[] = [
  'intent_created',
];

export function isDonationWorkflowStatus(value: string): value is DonationWorkflowStatus {
  return (DONATION_STATUSES as readonly string[]).includes(value);
}

/** Legacy aliases are read-only: pending → provider_pending, confirmed → provider_confirmed. */
export function toDonationWorkflowStatus(status: DonationStatus): DonationWorkflowStatus {
  if (status === 'pending') return 'provider_pending';
  if (status === 'confirmed') return 'provider_confirmed';
  return isDonationWorkflowStatus(status) ? status : 'intent_created';
}

export function isDonationTerminal(status: DonationWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function canDonationTransition(
  from: DonationWorkflowStatus,
  to: DonationWorkflowStatus,
  actor?: DonationActor,
): boolean {
  return DONATION_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextDonationStatuses(
  from: DonationWorkflowStatus,
  actor?: DonationActor,
): readonly DonationWorkflowStatus[] {
  return DONATION_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertDonationTransition(
  from: DonationWorkflowStatus,
  to: DonationWorkflowStatus,
  actor?: DonationActor,
): Result<DonationWorkflowStatus> {
  if (canDonationTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}

/** Hard client boundary: never writes past intent_created, never as provider/finance. */
export function assertClientDonationWrite(
  status: DonationStatus,
  to: DonationWorkflowStatus,
): Result<DonationWorkflowStatus> {
  const from = toDonationWorkflowStatus(status);
  if (!CLIENT_WRITABLE_DONATION_STATUSES.includes(from)) {
    return { ok: false, error: AppError.forbidden({ code: 'CLIENT_WRITE_FORBIDDEN' }) };
  }
  return assertDonationTransition(from, to, 'donor');
}
