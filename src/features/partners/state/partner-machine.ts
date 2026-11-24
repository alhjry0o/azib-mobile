// Pure partner lifecycle. 6 statuses, 10 declared transitions.
// The crown is NOT derived here — see verification.isVerified (D-3).
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { PartnerStatus } from '@/repositories/contracts/partner';

export const PARTNER_STATUSES = [
  'draft',
  'pending_verification',
  'verified',
  'rejected',
  'suspended',
  'expired',
] as const;
export type PartnerWorkflowStatus = (typeof PARTNER_STATUSES)[number];

export type PartnerActor = 'partner_owner' | 'partner_verifier' | 'moderator' | 'admin' | 'system';

export interface PartnerTransition {
  readonly from: PartnerWorkflowStatus;
  readonly to: PartnerWorkflowStatus;
  readonly actor: PartnerActor;
}

export const PARTNER_TRANSITIONS: readonly PartnerTransition[] = Object.freeze([
  Object.freeze({ from: 'draft', to: 'pending_verification', actor: 'partner_owner' }),
  Object.freeze({ from: 'pending_verification', to: 'verified', actor: 'partner_verifier' }),
  Object.freeze({ from: 'pending_verification', to: 'rejected', actor: 'partner_verifier' }),
  Object.freeze({ from: 'rejected', to: 'pending_verification', actor: 'partner_owner' }),
  Object.freeze({ from: 'verified', to: 'suspended', actor: 'moderator' }),
  Object.freeze({ from: 'verified', to: 'expired', actor: 'system' }),
  Object.freeze({ from: 'verified', to: 'pending_verification', actor: 'partner_verifier' }),
  Object.freeze({ from: 'suspended', to: 'verified', actor: 'admin' }),
  Object.freeze({ from: 'suspended', to: 'expired', actor: 'system' }),
  Object.freeze({ from: 'expired', to: 'pending_verification', actor: 'partner_owner' }),
] as const);

export function isPartnerWorkflowStatus(value: string): value is PartnerWorkflowStatus {
  return (PARTNER_STATUSES as readonly string[]).includes(value);
}

/** Every legacy value already exists in the workflow vocabulary. */
export function toPartnerWorkflowStatus(status: PartnerStatus): PartnerWorkflowStatus {
  return isPartnerWorkflowStatus(status) ? status : 'draft';
}

export function canPartnerTransition(
  from: PartnerWorkflowStatus,
  to: PartnerWorkflowStatus,
  actor?: PartnerActor,
): boolean {
  return PARTNER_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextPartnerStatuses(
  from: PartnerWorkflowStatus,
  actor?: PartnerActor,
): readonly PartnerWorkflowStatus[] {
  return PARTNER_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertPartnerTransition(
  from: PartnerWorkflowStatus,
  to: PartnerWorkflowStatus,
  actor?: PartnerActor,
): Result<PartnerWorkflowStatus> {
  if (canPartnerTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}
