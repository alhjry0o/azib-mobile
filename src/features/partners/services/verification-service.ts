// Staff-side verification decisions and lifecycle moderation.
// The partner status is a consequence of the verification record, never a
// field a partner can write for themselves.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { Partner, PartnerRepository } from '@/repositories/contracts/partner';
import type { PartnerVerificationRepository } from '@/repositories/contracts/partner-verification';
import { DEFAULT_REVERIFICATION_DAYS } from '../config/limits';
import {
  assertPartnerTransition,
  toPartnerWorkflowStatus,
  type PartnerActor,
} from '../state/partner-machine';
import { can, type MarketplaceRole } from '../state/permissions';
import { reverifyDeadline } from '../state/verification';

export interface VerificationDeps {
  readonly partners: PartnerRepository;
  readonly verifications: PartnerVerificationRepository;
  readonly audit: AuditRepository;
}

async function loadPartner(
  deps: VerificationDeps,
  partnerId: string,
): Promise<Result<Partner>> {
  const found = await deps.partners.getById(partnerId);
  if (!found.ok) return found;
  if (!found.value) return { ok: false, error: AppError.notFound({ code: 'PARTNER_NOT_FOUND' }) };
  return ok(found.value);
}

export async function decideVerification(
  deps: VerificationDeps,
  partnerId: string,
  verificationId: string,
  actorRole: MarketplaceRole,
  actorId: string,
  decision: 'verified' | 'rejected',
  reasonKey?: string,
  intervalDays: number = DEFAULT_REVERIFICATION_DAYS,
): Promise<Result<Partner>> {
  if (!can(actorRole, 'decide_verification')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (decision === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  const partner = await loadPartner(deps, partnerId);
  if (!partner.ok) return partner;

  const now = new Date().toISOString();
  const validUntil = decision === 'verified' ? reverifyDeadline(now, intervalDays) : null;
  const decided = await deps.verifications.decide(verificationId, {
    decision,
    decidedBy: actorId,
    reasonKey: reasonKey ?? null,
    validUntil,
  });
  if (!decided.ok) return decided;

  const from = toPartnerWorkflowStatus(partner.value.status);
  const allowed = assertPartnerTransition(from, decision, 'partner_verifier');
  if (!allowed.ok) return allowed;

  const moved = await deps.partners.update(partnerId, {
    status: decision,
    verificationId,
    verifiedAt: decision === 'verified' ? now : null,
    reverifyAfter: validUntil,
    rejectionReasonKey: decision === 'rejected' ? (reasonKey ?? null) : null,
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `partner.verification.${decision}`,
    target: `partner:${partnerId}`,
    meta: { from, to: decision },
  });
  return ok(moved.value);
}

async function transition(
  deps: VerificationDeps,
  partnerId: string,
  to: Parameters<typeof assertPartnerTransition>[1],
  actor: PartnerActor,
  actorId: string,
  patch: Parameters<PartnerRepository['update']>[1],
): Promise<Result<Partner>> {
  const partner = await loadPartner(deps, partnerId);
  if (!partner.ok) return partner;
  const from = toPartnerWorkflowStatus(partner.value.status);
  const allowed = assertPartnerTransition(from, to, actor);
  if (!allowed.ok) return allowed;
  const moved = await deps.partners.update(partnerId, { ...patch, status: to });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `partner.${to}`,
    target: `partner:${partnerId}`,
    meta: { from, to },
  });
  return ok(moved.value);
}

export async function requestReverification(
  deps: VerificationDeps,
  partnerId: string,
  actorRole: MarketplaceRole,
  actorId: string,
): Promise<Result<Partner>> {
  if (!can(actorRole, 'request_reverification')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  return transition(deps, partnerId, 'pending_verification', 'partner_verifier', actorId, {
    verifiedAt: null,
    reverifyAfter: null,
  });
}

/** Periodic expiry is a system transition, never a partner action. */
export async function expirePartner(
  deps: VerificationDeps,
  partnerId: string,
  actorId: string,
): Promise<Result<Partner>> {
  return transition(deps, partnerId, 'expired', 'system', actorId, {
    verifiedAt: null,
    reverifyAfter: null,
  });
}

export async function suspendPartner(
  deps: VerificationDeps,
  partnerId: string,
  actorRole: MarketplaceRole,
  actorId: string,
  reasonKey: string,
): Promise<Result<Partner>> {
  if (!can(actorRole, 'suspend_partner')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (!reasonKey) return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  return transition(deps, partnerId, 'suspended', 'moderator', actorId, {
    suspensionReasonKey: reasonKey,
  });
}

export async function reinstatePartner(
  deps: VerificationDeps,
  partnerId: string,
  actorRole: MarketplaceRole,
  actorId: string,
): Promise<Result<Partner>> {
  if (!can(actorRole, 'reinstate_partner')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  return transition(deps, partnerId, 'verified', 'admin', actorId, {
    suspensionReasonKey: null,
  });
}
