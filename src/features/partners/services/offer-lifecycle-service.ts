// Offer lifecycle. Publication requires a LIVE verification record for the
// owning partner. 'expired' is written by the system only.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type {
  CreateOfferInput,
  Offer,
  OfferRepository,
  UpdateOfferInput,
} from '@/repositories/contracts/offer';
import type { PartnerRepository } from '@/repositories/contracts/partner';
import type { PartnerVerificationRepository } from '@/repositories/contracts/partner-verification';
import { audienceOption } from '../config/limits';
import { OfferDraftSchema } from '../schemas/offer';
import {
  assertOfferTransition,
  toOfferWorkflowStatus,
} from '../state/offer-machine';
import { can, type MarketplaceRole } from '../state/permissions';
import { isVerified } from '../state/verification';

export interface OfferLifecycleDeps {
  readonly offers: OfferRepository;
  readonly partners: PartnerRepository;
  readonly verifications: PartnerVerificationRepository;
  readonly audit: AuditRepository;
}

async function loadOffer(deps: OfferLifecycleDeps, offerId: string): Promise<Result<Offer>> {
  const found = await deps.offers.getById(offerId);
  if (!found.ok) return found;
  if (!found.value) return { ok: false, error: AppError.notFound({ code: 'OFFER_NOT_FOUND' }) };
  return ok(found.value);
}

async function assertOwner(
  deps: OfferLifecycleDeps,
  offer: Offer,
  ownerId: string,
): Promise<Result<void>> {
  const partner = await deps.partners.getById(offer.partnerId);
  if (!partner.ok) return partner;
  if (!partner.value) return { ok: false, error: AppError.notFound({ code: 'PARTNER_NOT_FOUND' }) };
  if (partner.value.ownerId !== ownerId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_PARTNER_OWNER' }) };
  }
  return ok(undefined);
}

export async function createOfferDraft(
  deps: OfferLifecycleDeps,
  ownerId: string,
  partnerId: string,
  input: unknown,
): Promise<Result<Offer>> {
  if (!ownerId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = OfferDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  if (!audienceOption(parsed.data.audience).enabled) {
    return { ok: false, error: AppError.conflict({ code: 'AUDIENCE_NOT_APPROVED' }) };
  }
  const partner = await deps.partners.getById(partnerId);
  if (!partner.ok) return partner;
  if (!partner.value) return { ok: false, error: AppError.notFound({ code: 'PARTNER_NOT_FOUND' }) };
  if (partner.value.ownerId !== ownerId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_PARTNER_OWNER' }) };
  }
  if (partner.value.status === 'suspended') {
    return { ok: false, error: AppError.conflict({ code: 'PARTNER_SUSPENDED' }) };
  }

  const payload: CreateOfferInput = {
    partnerId,
    titleKey: 'marketplace:offers.title',
    title: parsed.data.title,
    discountPercent:
      parsed.data.discountType === 'percent' ? parsed.data.discountValue : 0,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    audience: parsed.data.audience,
    products: parsed.data.products,
    terms: parsed.data.terms,
    validFrom: parsed.data.validFrom,
    validUntil: parsed.data.validUntil,
    imageFileIds: parsed.data.imageFileIds,
    category: parsed.data.category,
    governorateId: parsed.data.governorateId,
  };
  const created = await deps.offers.create(payload);
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: ownerId,
    action: 'offer.draft.created',
    target: `offer:${created.value.id}`,
  });
  return ok(created.value);
}

export async function editOfferDraft(
  deps: OfferLifecycleDeps,
  offerId: string,
  ownerId: string,
  input: unknown,
): Promise<Result<Offer>> {
  const offer = await loadOffer(deps, offerId);
  if (!offer.ok) return offer;
  const owned = await assertOwner(deps, offer.value, ownerId);
  if (!owned.ok) return owned;
  const status = toOfferWorkflowStatus(offer.value.status);
  if (status !== 'draft' && status !== 'rejected') {
    return { ok: false, error: AppError.conflict({ code: 'OFFER_NOT_EDITABLE' }) };
  }
  const parsed = OfferDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  if (!audienceOption(parsed.data.audience).enabled) {
    return { ok: false, error: AppError.conflict({ code: 'AUDIENCE_NOT_APPROVED' }) };
  }
  const patch: UpdateOfferInput = {
    title: parsed.data.title,
    discountPercent: parsed.data.discountType === 'percent' ? parsed.data.discountValue : 0,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    audience: parsed.data.audience,
    products: parsed.data.products,
    terms: parsed.data.terms,
    validFrom: parsed.data.validFrom,
    validUntil: parsed.data.validUntil,
    imageFileIds: parsed.data.imageFileIds,
    category: parsed.data.category,
    governorateId: parsed.data.governorateId,
    rejectionReasonKey: null,
  };
  return deps.offers.update(offerId, patch);
}

async function ownerTransition(
  deps: OfferLifecycleDeps,
  offerId: string,
  ownerId: string,
  to: Parameters<typeof assertOfferTransition>[1],
  patch: UpdateOfferInput = {},
  action?: string,
): Promise<Result<Offer>> {
  const offer = await loadOffer(deps, offerId);
  if (!offer.ok) return offer;
  const owned = await assertOwner(deps, offer.value, ownerId);
  if (!owned.ok) return owned;
  const from = toOfferWorkflowStatus(offer.value.status);
  const allowed = assertOfferTransition(from, to, 'partner_owner');
  if (!allowed.ok) return allowed;
  const moved = await deps.offers.update(offerId, { ...patch, status: to });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId: ownerId,
    action: action ?? `offer.${to}`,
    target: `offer:${offerId}`,
    meta: { from, to },
  });
  return ok(moved.value);
}

export function submitOfferForReview(
  deps: OfferLifecycleDeps,
  offerId: string,
  ownerId: string,
): Promise<Result<Offer>> {
  return ownerTransition(deps, offerId, ownerId, 'in_review', {
    reviewRequestedAt: new Date().toISOString(),
    rejectionReasonKey: null,
  });
}

export function cancelOffer(
  deps: OfferLifecycleDeps,
  offerId: string,
  ownerId: string,
): Promise<Result<Offer>> {
  return ownerTransition(deps, offerId, ownerId, 'cancelled');
}

export function renewOffer(
  deps: OfferLifecycleDeps,
  offerId: string,
  ownerId: string,
  validFrom: string,
  validUntil: string,
): Promise<Result<Offer>> {
  if (Date.parse(validUntil) <= Date.parse(validFrom)) {
    return Promise.resolve({
      ok: false,
      error: AppError.validation({ code: 'INVALID_VALIDITY_WINDOW' }),
    });
  }
  return ownerTransition(deps, offerId, ownerId, 'in_review', { validFrom, validUntil });
}

export async function reviewOffer(
  deps: OfferLifecycleDeps,
  offerId: string,
  actorRole: MarketplaceRole,
  actorId: string,
  decision: 'approved' | 'rejected',
  reasonKey?: string,
): Promise<Result<Offer>> {
  if (!can(actorRole, 'review_offer')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (decision === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  const offer = await loadOffer(deps, offerId);
  if (!offer.ok) return offer;
  const from = toOfferWorkflowStatus(offer.value.status);
  const allowed = assertOfferTransition(from, decision, 'reviewer');
  if (!allowed.ok) return allowed;
  const moved = await deps.offers.update(offerId, {
    status: decision,
    rejectionReasonKey: decision === 'rejected' ? (reasonKey ?? null) : null,
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `offer.review.${decision}`,
    target: `offer:${offerId}`,
    meta: { from, to: decision },
  });
  return ok(moved.value);
}

/** Publication is gated by a LIVE verification record — never by a status field. */
export async function publishOffer(
  deps: OfferLifecycleDeps,
  offerId: string,
  actorRole: MarketplaceRole,
  actorId: string,
): Promise<Result<Offer>> {
  if (!can(actorRole, 'publish_offer')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const offer = await loadOffer(deps, offerId);
  if (!offer.ok) return offer;
  const latest = await deps.verifications.getLatest(offer.value.partnerId);
  if (!latest.ok) return latest;
  if (!isVerified(latest.value, new Date())) {
    return { ok: false, error: AppError.conflict({ code: 'PARTNER_NOT_VERIFIED' }) };
  }
  const from = toOfferWorkflowStatus(offer.value.status);
  const allowed = assertOfferTransition(from, 'active', 'reviewer');
  if (!allowed.ok) return allowed;
  const moved = await deps.offers.update(offerId, {
    status: 'active',
    publishedAt: new Date().toISOString(),
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: 'offer.published',
    target: `offer:${offerId}`,
    meta: { from, to: 'active' },
  });
  return ok(moved.value);
}

/** System-only: the client computes expiry but never writes it. */
export async function expireOffer(
  deps: OfferLifecycleDeps,
  offerId: string,
  actorId: string,
): Promise<Result<Offer>> {
  const offer = await loadOffer(deps, offerId);
  if (!offer.ok) return offer;
  const from = toOfferWorkflowStatus(offer.value.status);
  const allowed = assertOfferTransition(from, 'expired', 'system');
  if (!allowed.ok) return allowed;
  const moved = await deps.offers.update(offerId, { status: 'expired' });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: 'offer.expired',
    target: `offer:${offerId}`,
    meta: { from, to: 'expired' },
  });
  return ok(moved.value);
}
