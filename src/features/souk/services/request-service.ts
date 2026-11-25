import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { SoukRepository } from '@/repositories/contracts/souk';
import type {
  SoukRequest,
  SoukRequestRepository,
} from '@/repositories/contracts/souk-request';
import { checkChatRate } from '@/features/weddings/chat/rate-limit';
import { SoukRequestSchema } from '../schemas/request';
import { buildHandoverCode } from '../state/handover';
import { toItemWorkflowStatus } from '../state/item-machine';
import type { SoukLimits } from '../state/limits';
import { canSouk, type SoukRole } from '../state/permissions';
import {
  assertRequestTransition,
  isActiveRequestStatus,
  toRequestWorkflowStatus,
} from '../state/request-machine';
import { markItemHandedOver, releaseItem, reserveItem } from './item-service';

export interface SoukRequestDeps {
  readonly souk: SoukRepository;
  readonly requests: SoukRequestRepository;
  readonly audit: AuditRepository;
}

async function loadRequest(
  deps: SoukRequestDeps,
  requestId: string,
): Promise<Result<SoukRequest>> {
  const found = await deps.requests.getById(requestId);
  if (!found.ok) return found;
  if (!found.value) {
    return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };
  }
  return ok(found.value);
}

export async function createRequest(
  deps: SoukRequestDeps,
  itemId: string,
  requesterId: string,
  reason: string,
  limits: SoukLimits,
  now: Date,
): Promise<Result<SoukRequest>> {
  if (!requesterId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = SoukRequestSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const item = await deps.souk.getById(itemId);
  if (!item.ok) return item;
  if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
  const snapshot = item.value;
  if (snapshot.donorId === requesterId) {
    return { ok: false, error: AppError.conflict({ code: 'OWN_ITEM' }) };
  }
  if (toItemWorkflowStatus(snapshot.status) !== 'available') {
    return { ok: false, error: AppError.conflict({ code: 'ITEM_NOT_AVAILABLE' }) };
  }

  const mine = await deps.requests.listByRequester(requesterId);
  if (!mine.ok) return mine;
  const active = mine.value.filter((r) =>
    isActiveRequestStatus(toRequestWorkflowStatus(r.status)),
  );
  if (active.length >= limits.maxActiveRequests) {
    return { ok: false, error: AppError.conflict({ code: 'ACTIVE_REQUEST_LIMIT' }) };
  }
  if (active.some((r) => r.itemId === itemId)) {
    return { ok: false, error: AppError.conflict({ code: 'DUPLICATE_REQUEST' }) };
  }
  const rate = checkChatRate(
    mine.value.map((r) => Date.parse(r.createdAt)),
    now.getTime(),
    limits.requestCreateRate,
  );
  if (!rate.allowed) {
    return { ok: false, error: AppError.conflict({ code: 'REQUEST_RATE_LIMITED' }) };
  }

  const created = await deps.requests.create({
    itemId,
    requesterId,
    reason: parsed.data.reason,
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: requesterId,
    action: 'souk.request.created',
    target: `souk-request:${created.value.id}`,
  });
  return ok(created.value);
}

export async function decideRequest(
  deps: SoukRequestDeps,
  requestId: string,
  actorId: string,
  actorRole: SoukRole,
  decision: 'accepted' | 'rejected',
  now: Date,
  reasonKey?: string,
): Promise<Result<SoukRequest>> {
  const request = await loadRequest(deps, requestId);
  if (!request.ok) return request;
  const snapshot = request.value;
  const item = await deps.souk.getById(snapshot.itemId);
  if (!item.ok) return item;
  if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
  const itemSnapshot = item.value;

  const isDonor = itemSnapshot.donorId === actorId;
  const isStaff = canSouk(actorRole, 'decide_request');
  if (!isDonor && !isStaff) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (decision === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  const actor = isDonor ? 'donor' : 'moderator';
  const from = toRequestWorkflowStatus(snapshot.status);
  const allowed = assertRequestTransition(from, decision, actor);
  if (!allowed.ok) return allowed;

  const acceptedAt = now.toISOString();
  const moved = await deps.requests.update(requestId, {
    status: decision,
    decidedBy: actorId,
    decidedAt: acceptedAt,
    reasonKey: reasonKey ?? null,
    ...(decision === 'accepted'
      ? { handoverCode: buildHandoverCode(requestId, acceptedAt) }
      : {}),
  });
  if (!moved.ok) return moved;

  if (decision === 'accepted') {
    const reserved = await reserveItem(deps, snapshot.itemId, requestId, actorId);
    if (!reserved.ok) return reserved;
  }
  await deps.audit.append({
    actorId,
    action: `souk.request.${decision}`,
    target: `souk-request:${requestId}`,
    meta: { from, to: decision },
  });
  return ok(moved.value);
}

export async function cancelRequest(
  deps: SoukRequestDeps,
  requestId: string,
  actorId: string,
  actorRole: SoukRole,
): Promise<Result<SoukRequest>> {
  const request = await loadRequest(deps, requestId);
  if (!request.ok) return request;
  const snapshot = request.value;
  const item = await deps.souk.getById(snapshot.itemId);
  if (!item.ok) return item;
  if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };

  const isRequester = snapshot.requesterId === actorId;
  const isDonor = item.value.donorId === actorId;
  const isStaff = canSouk(actorRole, 'moderate_content');
  if (!isRequester && !isDonor && !isStaff) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const actor = isRequester ? 'requester' : isDonor ? 'donor' : 'moderator';
  const from = toRequestWorkflowStatus(snapshot.status);
  const allowed = assertRequestTransition(from, 'cancelled', actor);
  if (!allowed.ok) return allowed;

  const moved = await deps.requests.update(requestId, { status: 'cancelled' });
  if (!moved.ok) return moved;
  if (from === 'accepted') {
    const released = await releaseItem(deps, snapshot.itemId, actorId);
    if (!released.ok) return released;
  }
  await deps.audit.append({
    actorId,
    action: 'souk.request.cancelled',
    target: `souk-request:${requestId}`,
    meta: { from, to: 'cancelled' },
  });
  return ok(moved.value);
}

/** Called by the handover service once BOTH parties confirmed. */
export async function completeRequest(
  deps: SoukRequestDeps,
  requestId: string,
  actorId: string,
  now: Date,
): Promise<Result<SoukRequest>> {
  const request = await loadRequest(deps, requestId);
  if (!request.ok) return request;
  const snapshot = request.value;
  const from = toRequestWorkflowStatus(snapshot.status);
  const allowed = assertRequestTransition(from, 'handed_over', 'system');
  if (!allowed.ok) return allowed;
  const moved = await deps.requests.update(requestId, {
    status: 'handed_over',
    handedOverAt: now.toISOString(),
  });
  if (!moved.ok) return moved;
  const item = await markItemHandedOver(deps, snapshot.itemId, actorId);
  if (!item.ok) return item;
  await deps.audit.append({
    actorId,
    action: 'souk.request.handed_over',
    target: `souk-request:${requestId}`,
    meta: { from, to: 'handed_over' },
  });
  return ok(moved.value);
}
