// Saves, aggregate views and offer reports. Views never carry a viewer id (D-8).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { OfferRepository } from '@/repositories/contracts/offer';
import type {
  OfferReport,
  OfferReportRepository,
} from '@/repositories/contracts/offer-report';
import type {
  OfferSave,
  PartnerEngagementRepository,
} from '@/repositories/contracts/partner-engagement';
import { OfferReportSchema } from '../schemas/offer';

export interface EngagementDeps {
  readonly offers: OfferRepository;
  readonly offerReports: OfferReportRepository;
  readonly engagement: PartnerEngagementRepository;
  readonly audit: AuditRepository;
}

async function requireOffer(
  deps: EngagementDeps,
  offerId: string,
): Promise<Result<void>> {
  const found = await deps.offers.getById(offerId);
  if (!found.ok) return found;
  if (!found.value) return { ok: false, error: AppError.notFound({ code: 'OFFER_NOT_FOUND' }) };
  return ok(undefined);
}

export async function saveOffer(
  deps: EngagementDeps,
  offerId: string,
  userId: string,
): Promise<Result<OfferSave>> {
  if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const exists = await requireOffer(deps, offerId);
  if (!exists.ok) return exists;
  return deps.engagement.save(userId, offerId);
}

export async function unsaveOffer(
  deps: EngagementDeps,
  offerId: string,
  userId: string,
): Promise<Result<void>> {
  if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  return deps.engagement.unsave(userId, offerId);
}

export async function reportOffer(
  deps: EngagementDeps,
  offerId: string,
  userId: string,
  reasonKey: string,
  detail: string,
): Promise<Result<OfferReport>> {
  if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = OfferReportSchema.safeParse({ offerId, reasonKey, detail });
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const exists = await requireOffer(deps, offerId);
  if (!exists.ok) return exists;
  const created = await deps.offerReports.create({
    offerId,
    reporterId: userId,
    reasonKey,
    detail: detail.trim(),
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: userId,
    action: 'offer.reported',
    target: `offer:${offerId}`,
    meta: { reasonKey },
  });
  return ok(created.value);
}

/** Aggregate counter only — deliberately takes no viewer identity. */
export async function recordOfferView(
  deps: EngagementDeps,
  offerId: string,
): Promise<Result<number>> {
  const exists = await requireOffer(deps, offerId);
  if (!exists.ok) return exists;
  return deps.engagement.recordView(offerId);
}
