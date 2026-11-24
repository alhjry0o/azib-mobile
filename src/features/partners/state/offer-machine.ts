// Pure offer lifecycle. 7 statuses, 8 declared transitions.
// 'expired' is written by the system only; the client computes and displays it.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { OfferStatus } from '@/repositories/contracts/offer';

export const OFFER_STATUSES = [
  'draft',
  'in_review',
  'approved',
  'active',
  'expired',
  'rejected',
  'cancelled',
] as const;
export type OfferWorkflowStatus = (typeof OFFER_STATUSES)[number];

export type OfferActor = 'partner_owner' | 'reviewer' | 'system';

export interface OfferTransition {
  readonly from: OfferWorkflowStatus;
  readonly to: OfferWorkflowStatus;
  readonly actor: OfferActor;
}

export const OFFER_TRANSITIONS: readonly OfferTransition[] = Object.freeze([
  Object.freeze({ from: 'draft', to: 'in_review', actor: 'partner_owner' }),
  Object.freeze({ from: 'in_review', to: 'approved', actor: 'reviewer' }),
  Object.freeze({ from: 'in_review', to: 'rejected', actor: 'reviewer' }),
  Object.freeze({ from: 'approved', to: 'active', actor: 'reviewer' }),
  Object.freeze({ from: 'active', to: 'expired', actor: 'system' }),
  Object.freeze({ from: 'active', to: 'cancelled', actor: 'partner_owner' }),
  Object.freeze({ from: 'expired', to: 'in_review', actor: 'partner_owner' }),
  Object.freeze({ from: 'rejected', to: 'in_review', actor: 'partner_owner' }),
] as const);

const TERMINAL: readonly OfferWorkflowStatus[] = ['cancelled'];

export function isOfferWorkflowStatus(value: string): value is OfferWorkflowStatus {
  return (OFFER_STATUSES as readonly string[]).includes(value);
}

export function toOfferWorkflowStatus(status: OfferStatus): OfferWorkflowStatus {
  return isOfferWorkflowStatus(status) ? status : 'draft';
}

export function isOfferTerminal(status: OfferWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function canOfferTransition(
  from: OfferWorkflowStatus,
  to: OfferWorkflowStatus,
  actor?: OfferActor,
): boolean {
  return OFFER_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextOfferStatuses(
  from: OfferWorkflowStatus,
  actor?: OfferActor,
): readonly OfferWorkflowStatus[] {
  return OFFER_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertOfferTransition(
  from: OfferWorkflowStatus,
  to: OfferWorkflowStatus,
  actor?: OfferActor,
): Result<OfferWorkflowStatus> {
  if (canOfferTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}

/** The client may never write 'expired' — it is a system-derived state. */
export function isClientWritableOfferStatus(to: OfferWorkflowStatus): boolean {
  return to !== 'expired';
}
