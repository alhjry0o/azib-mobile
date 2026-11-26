import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import {
  assertCanConfirmHandover,
  isHandoverComplete,
  validateRating,
} from '../state/handover';
import { canViewRatings, type SoukRole } from '../state/permissions';
import { toRequestWorkflowStatus } from '../state/request-machine';
import { completeRequest, type SoukRequestDeps } from './request-service';

export async function confirmHandover(
  deps: SoukRequestDeps,
  requestId: string,
  userId: string,
  enteredCode: string,
  now: Date,
): Promise<Result<SoukRequest>> {
  const found = await deps.requests.getById(requestId);
  if (!found.ok) return found;
  const request = found.value;
  if (!request) return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };
  const snapshot = request;
  const item = await deps.souk.getById(snapshot.itemId);
  if (!item.ok) return item;
  if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
  const donorId = item.value.donorId ?? '';

  const allowed = assertCanConfirmHandover({
    requestStatus: snapshot.status,
    storedCode: snapshot.handoverCode ?? null,
    enteredCode,
    donorId,
    requesterId: snapshot.requesterId,
    userId,
  });
  if (!allowed.ok) return allowed;

  const stamp = now.toISOString();
  const patch =
    allowed.value === 'donor'
      ? { donorConfirmedAt: stamp }
      : { recipientConfirmedAt: stamp };
  const moved = await deps.requests.update(requestId, patch);
  if (!moved.ok) return moved;
  const after = moved.value;
  await deps.audit.append({
    actorId: userId,
    action: `souk.handover.${allowed.value}_confirmed`,
    target: `souk-request:${requestId}`,
  });

  if (isHandoverComplete(after.donorConfirmedAt, after.recipientConfirmedAt)) {
    return completeRequest(deps, requestId, userId, now);
  }
  return ok(after);
}

export async function rateExperience(
  deps: SoukRequestDeps,
  requestId: string,
  userId: string,
  score: number,
  note: string | null,
  now: Date,
): Promise<Result<SoukRequest>> {
  const found = await deps.requests.getById(requestId);
  if (!found.ok) return found;
  const request = found.value;
  if (!request) return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };
  const snapshot = request;
  const item = await deps.souk.getById(snapshot.itemId);
  if (!item.ok) return item;
  if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
  const isParty =
    userId === (item.value.donorId ?? '') || userId === snapshot.requesterId;
  if (!isParty) return { ok: false, error: AppError.forbidden({ code: 'NOT_A_PARTY' }) };
  if (toRequestWorkflowStatus(snapshot.status) !== 'handed_over') {
    return { ok: false, error: AppError.conflict({ code: 'HANDOVER_NOT_COMPLETED' }) };
  }
  const parsed = validateRating({ score, note });
  if (!parsed.ok) return parsed;
  const moved = await deps.requests.update(requestId, {
    rating: parsed.value.score,
    ratingNote: parsed.value.note,
    ratedBy: userId,
    ratedAt: now.toISOString(),
  });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId: userId,
    action: 'souk.experience.rated',
    target: `souk-request:${requestId}`,
  });
  return ok(moved.value);
}

export interface StaffRatingView {
  readonly requestId: string;
  readonly score: number;
  readonly note: string | null;
  readonly ratedAt: string | null;
}

/** Staff-private read. Never exposed on a public or party surface (D-7). */
export function readRatingForStaff(
  request: SoukRequest,
  role: SoukRole,
): Result<StaffRatingView | null> {
  if (!canViewRatings(role)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (request.rating === null || request.rating === undefined) return ok(null);
  return ok({
    requestId: request.id,
    score: request.rating,
    note: request.ratingNote ?? null,
    ratedAt: request.ratedAt ?? null,
  });
}
