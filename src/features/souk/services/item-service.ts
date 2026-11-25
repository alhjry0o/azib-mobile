// Item lifecycle. The machine is checked BEFORE any write (ADR-0060).
// New items start as 'draft' HERE — the mock factory keeps 'available' so
// seeded items stay browsable.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { SoukItem, SoukRepository } from '@/repositories/contracts/souk';
import { checkChatRate } from '@/features/weddings/chat/rate-limit';
import { ItemDraftSchema } from '../schemas/item';
import { detectDuplicate } from '../state/duplicate';
import {
  assertItemTransition,
  toItemWorkflowStatus,
  type ItemActor,
  type ItemWorkflowStatus,
} from '../state/item-machine';
import { itemExpiryFrom, type SoukLimits } from '../state/limits';
import { canSouk, type SoukRole } from '../state/permissions';
import { detectSaleWords, hasNoResaleConsent } from '../state/sale-lexicon';

export interface SoukItemDeps {
  readonly souk: SoukRepository;
  readonly audit: AuditRepository;
}

export interface CreateItemInput {
  readonly donorId: string;
  readonly title: string;
  readonly category: string;
  readonly condition: 'new' | 'good' | 'acceptable';
  readonly description: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly deliveryMethod: 'self_pickup' | 'donor_delivers' | 'volunteer_help';
  readonly imageFileIds: readonly string[];
  readonly imageFingerprints: readonly string[];
  readonly estimatedValue: number | null;
  readonly noResaleConsent: boolean;
}

async function loadItem(deps: SoukItemDeps, itemId: string): Promise<Result<SoukItem>> {
  const found = await deps.souk.getById(itemId);
  if (!found.ok) return found;
  if (!found.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
  return ok(found.value);
}

export async function createItemDraft(
  deps: SoukItemDeps,
  input: CreateItemInput,
  limits: SoukLimits,
  now: Date,
): Promise<Result<SoukItem>> {
  if (!input.donorId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = ItemDraftSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  if (!hasNoResaleConsent(input.noResaleConsent ? now.toISOString() : null)) {
    return { ok: false, error: AppError.validation({ code: 'NO_RESALE_CONSENT_REQUIRED' }) };
  }
  if (input.imageFileIds.length > limits.maxItemImages) {
    return { ok: false, error: AppError.validation({ code: 'TOO_MANY_IMAGES' }) };
  }

  const listed = await deps.souk.list({ limit: 200 });
  if (!listed.ok) return listed;
  const mine = listed.value.items.filter((i) => i.donorId === input.donorId);
  const rate = checkChatRate(
    mine.map((i) => Date.parse(i.createdAt)),
    now.getTime(),
    limits.itemCreateRate,
  );
  if (!rate.allowed) {
    return { ok: false, error: AppError.conflict({ code: 'ITEM_RATE_LIMITED' }) };
  }

  const sale = detectSaleWords(`${input.title} ${input.description}`);
  const duplicate = detectDuplicate(
    {
      imageFingerprints: input.imageFingerprints,
      title: input.title,
      governorateId: input.governorateId,
      donorId: input.donorId,
    },
    listed.value.items,
  );

  const created = await deps.souk.create({
    titleKey: 'marketplace:souk.customItem',
    title: input.title,
    category: input.category,
    description: input.description,
    donorId: input.donorId,
    condition: input.condition,
    governorateId: input.governorateId,
    districtId: input.districtId,
    deliveryMethod: input.deliveryMethod,
    imageFileIds: input.imageFileIds,
    imageFingerprints: input.imageFingerprints,
    estimatedValue: input.estimatedValue,
    noResaleConsentAt: now.toISOString(),
  });
  if (!created.ok) return created;

  // The factory defaults to 'available'; a user item must start as a draft.
  const drafted = await deps.souk.update(created.value.id, {
    status: 'draft',
    saleWordFlag: sale.flagged,
    duplicateFlag: duplicate.flagged,
  });
  if (!drafted.ok) return drafted;
  await deps.audit.append({
    actorId: input.donorId,
    action: 'souk.item.draft',
    target: `souk-item:${created.value.id}`,
    meta: { saleFlag: sale.flagged, duplicateFlag: duplicate.flagged },
  });
  return ok(drafted.value);
}

async function move(
  deps: SoukItemDeps,
  itemId: string,
  to: ItemWorkflowStatus,
  actor: ItemActor,
  actorId: string,
  patch: Parameters<SoukRepository['update']>[1] = {},
): Promise<Result<SoukItem>> {
  const item = await loadItem(deps, itemId);
  if (!item.ok) return item;
  const snapshot = item.value;
  const from = toItemWorkflowStatus(snapshot.status);
  const allowed = assertItemTransition(from, to, actor);
  if (!allowed.ok) return allowed;
  const moved = await deps.souk.update(itemId, { ...patch, status: to });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `souk.item.${to}`,
    target: `souk-item:${itemId}`,
    meta: { from, to },
  });
  return ok(moved.value);
}

/** Walks draft → pending_review → available, never skipping a declared step. */
export async function submitItemForPublication(
  deps: SoukItemDeps,
  itemId: string,
  donorId: string,
  limits: SoukLimits,
  now: Date,
): Promise<Result<SoukItem>> {
  const item = await loadItem(deps, itemId);
  if (!item.ok) return item;
  const snapshot = item.value;
  if (snapshot.donorId !== donorId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_ITEM_DONOR' }) };
  }
  if (!hasNoResaleConsent(snapshot.noResaleConsentAt)) {
    return { ok: false, error: AppError.validation({ code: 'NO_RESALE_CONSENT_REQUIRED' }) };
  }
  if (limits.requireItemReview) {
    return move(deps, itemId, 'pending_review', 'donor', donorId);
  }
  const published = await move(deps, itemId, 'available', 'donor', donorId, {
    expiresAt: itemExpiryFrom(now.toISOString(), limits.itemExpiryDays),
  });
  return published;
}

export async function reviewItem(
  deps: SoukItemDeps,
  itemId: string,
  actorRole: SoukRole,
  actorId: string,
  decision: 'available' | 'rejected',
  limits: SoukLimits,
  now: Date,
  reasonKey?: string,
): Promise<Result<SoukItem>> {
  if (!canSouk(actorRole, 'publish_item')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (decision === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  return move(deps, itemId, decision, 'moderator', actorId, {
    ...(decision === 'available'
      ? { expiresAt: itemExpiryFrom(now.toISOString(), limits.itemExpiryDays) }
      : { rejectionReasonKey: reasonKey ?? null }),
  });
}

export async function withdrawItem(
  deps: SoukItemDeps,
  itemId: string,
  donorId: string,
): Promise<Result<SoukItem>> {
  const item = await loadItem(deps, itemId);
  if (!item.ok) return item;
  if (item.value.donorId !== donorId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_ITEM_DONOR' }) };
  }
  return move(deps, itemId, 'withdrawn', 'donor', donorId);
}

/** System-only: the client computes expiry but never writes it. */
export async function expireItem(
  deps: SoukItemDeps,
  itemId: string,
  actorId: string,
): Promise<Result<SoukItem>> {
  return move(deps, itemId, 'expired', 'system', actorId);
}

export async function relistItem(
  deps: SoukItemDeps,
  itemId: string,
  donorId: string,
): Promise<Result<SoukItem>> {
  const item = await loadItem(deps, itemId);
  if (!item.ok) return item;
  if (item.value.donorId !== donorId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_ITEM_DONOR' }) };
  }
  return move(deps, itemId, 'draft', 'donor', donorId, { expiresAt: null });
}

/** System transitions driven by request acceptance/cancellation. */
export function reserveItem(
  deps: SoukItemDeps,
  itemId: string,
  requestId: string,
  actorId: string,
): Promise<Result<SoukItem>> {
  return move(deps, itemId, 'reserved', 'system', actorId, {
    reservedForRequestId: requestId,
  });
}

export function releaseItem(
  deps: SoukItemDeps,
  itemId: string,
  actorId: string,
): Promise<Result<SoukItem>> {
  return move(deps, itemId, 'available', 'system', actorId, { reservedForRequestId: null });
}

export function markItemHandedOver(
  deps: SoukItemDeps,
  itemId: string,
  actorId: string,
): Promise<Result<SoukItem>> {
  return move(deps, itemId, 'handed_over', 'system', actorId);
}
