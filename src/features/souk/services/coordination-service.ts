// Coordination chat: accepted requests only, text only, P10 filter + rate.
// Contact disclosure is progressive and needs BOTH consents (D-5).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { ProfileRepository } from '@/repositories/contracts/profile';
import type { SoukChatMessage, SoukChatRepository } from '@/repositories/contracts/souk-chat';
import type { SoukRepository } from '@/repositories/contracts/souk';
import type {
  SoukRequest,
  SoukRequestRepository,
} from '@/repositories/contracts/souk-request';
import { filterChatMessage } from '@/features/weddings/chat/message-filter';
import { checkChatRate } from '@/features/weddings/chat/rate-limit';
import {
  counterpartyId,
  disclosedPhone,
  disclosureState,
  type DisclosureState,
} from '../state/contact-disclosure';
import { DEFAULT_SOUK_CHAT_RATE } from '../state/limits';
import { canSouk, type SoukRole } from '../state/permissions';
import { toRequestWorkflowStatus } from '../state/request-machine';

export interface CoordinationDeps {
  readonly souk: SoukRepository;
  readonly requests: SoukRequestRepository;
  readonly chat: SoukChatRepository;
  readonly profiles: ProfileRepository;
  readonly audit: AuditRepository;
}

interface PartyContext {
  readonly request: SoukRequest;
  readonly donorId: string;
  readonly isParty: boolean;
}

async function partyContext(
  deps: CoordinationDeps,
  requestId: string,
  userId: string,
): Promise<Result<PartyContext>> {
  const found = await deps.requests.getById(requestId);
  if (!found.ok) return found;
  const request = found.value;
  if (!request) return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };
  const item = await deps.souk.getById(request.itemId);
  if (!item.ok) return item;
  if (!item.value) return { ok: false, error: AppError.notFound({ code: 'ITEM_NOT_FOUND' }) };
  const donorId = item.value.donorId ?? '';
  const isParty = userId === donorId || userId === request.requesterId;
  return ok({ request, donorId, isParty });
}

export async function setContactConsent(
  deps: CoordinationDeps,
  requestId: string,
  userId: string,
  consent: boolean,
): Promise<Result<SoukRequest>> {
  const context = await partyContext(deps, requestId, userId);
  if (!context.ok) return context;
  const snapshot = context.value;
  if (!snapshot.isParty) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_A_PARTY' }) };
  }
  if (toRequestWorkflowStatus(snapshot.request.status) !== 'accepted') {
    return { ok: false, error: AppError.conflict({ code: 'REQUEST_NOT_ACCEPTED' }) };
  }
  const patch =
    userId === snapshot.donorId
      ? { donorContactConsent: consent }
      : { recipientContactConsent: consent };
  return deps.requests.update(requestId, patch);
}

export interface DisclosureView {
  readonly state: DisclosureState;
  readonly phone: string | null;
  readonly reasonKey: string;
}

export async function readCounterpartyContact(
  deps: CoordinationDeps,
  requestId: string,
  viewerId: string,
): Promise<Result<DisclosureView>> {
  const context = await partyContext(deps, requestId, viewerId);
  if (!context.ok) return context;
  const snapshot = context.value;
  const input = {
    requestStatus: snapshot.request.status,
    donorContactConsent: snapshot.request.donorContactConsent,
    recipientContactConsent: snapshot.request.recipientContactConsent,
    viewerId,
    donorId: snapshot.donorId,
    requesterId: snapshot.request.requesterId,
  };
  const state = disclosureState(input);
  const other = counterpartyId(input);
  let phone: string | null = null;
  if (state === 'ready' && other) {
    const profile = await deps.profiles.getByUserId(other);
    if (!profile.ok) return profile;
    phone = disclosedPhone(input, profile.value?.phone ?? null);
  }
  return ok({
    state,
    phone,
    reasonKey: `marketplace:souk.disclosure.${state}`,
  });
}

export async function sendCoordinationMessage(
  deps: CoordinationDeps,
  requestId: string,
  userId: string,
  text: string,
  now: Date,
): Promise<Result<SoukChatMessage>> {
  const context = await partyContext(deps, requestId, userId);
  if (!context.ok) return context;
  const snapshot = context.value;
  if (!snapshot.isParty) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_A_PARTY' }) };
  }
  if (toRequestWorkflowStatus(snapshot.request.status) !== 'accepted') {
    return { ok: false, error: AppError.conflict({ code: 'REQUEST_NOT_ACCEPTED' }) };
  }
  const filtered = filterChatMessage(text);
  if (!filtered.allowed) {
    return {
      ok: false,
      error: AppError.validation({
        code: 'CHAT_CONTENT_BLOCKED',
        context: { reason: filtered.reason },
      }),
    };
  }
  const messages = await deps.chat.listMessages(requestId);
  if (!messages.ok) return messages;
  const mine = messages.value
    .filter((m) => m.authorId === userId)
    .map((m) => Date.parse(m.createdAt));
  const rate = checkChatRate(mine, now.getTime(), DEFAULT_SOUK_CHAT_RATE);
  if (!rate.allowed) {
    return { ok: false, error: AppError.conflict({ code: 'CHAT_RATE_LIMITED' }) };
  }
  return deps.chat.sendMessage({ requestId, authorId: userId, text: text.trim() });
}

export async function reportMessage(
  deps: CoordinationDeps,
  requestId: string,
  messageId: string,
  userId: string,
): Promise<Result<SoukChatMessage>> {
  const context = await partyContext(deps, requestId, userId);
  if (!context.ok) return context;
  if (!context.value.isParty) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_A_PARTY' }) };
  }
  return deps.chat.reportMessage(messageId, userId);
}

export async function removeMessage(
  deps: CoordinationDeps,
  messageId: string,
  actorRole: SoukRole,
  actorId: string,
): Promise<Result<SoukChatMessage>> {
  if (!canSouk(actorRole, 'moderate_content')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const removed = await deps.chat.removeMessage(messageId, actorId);
  if (!removed.ok) return removed;
  await deps.audit.append({
    actorId,
    action: 'souk.chat.removed',
    target: `souk-message:${messageId}`,
  });
  return ok(removed.value);
  }
