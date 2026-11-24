// Chat rules are enforced HERE, not in the repository (ADR-0027 pattern).
// Order: membership/mute → content filter → rate limit → persist.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type {
  ChatMessage,
  ChatMute,
  WeddingChatRepository,
} from '@/repositories/contracts/wedding-chat';
import type { WeddingGroupRepository } from '@/repositories/contracts/wedding-group';
import { filterChatMessage } from '../chat/message-filter';
import { canModerate, canReport, canSendMessage } from '../chat/moderation';
import { checkChatRate } from '../chat/rate-limit';
import { retentionCutoff } from '../chat/retention';

export interface ChatDeps {
  readonly chat: WeddingChatRepository;
  readonly groups: WeddingGroupRepository;
  readonly audit: AuditRepository;
}

export async function sendChatMessage(
  deps: ChatDeps,
  groupId: string,
  userId: string,
  text: string,
  now: Date,
): Promise<Result<ChatMessage>> {
  const member = await deps.groups.getMember(groupId, userId);
  if (!member.ok) return member;
  const active = member.value !== null && member.value.status === 'active';
  const mutes = await deps.chat.listMutes(groupId);
  if (!mutes.ok) return mutes;
  const mute = mutes.value.find((m) => m.userId === userId) ?? null;

  const eligibility = canSendMessage({
    role: active ? member.value!.role : null,
    isActiveMember: active,
    // undefined ⇒ no mute record · null ⇒ open-ended mute. Never `?? null`.
    mutedUntil: mute ? mute.until : undefined,
    now,
  });
  if (!eligibility.allowed) {
    return { ok: false, error: AppError.forbidden({ code: 'CHAT_BLOCKED' }) };
  }

  const filtered = filterChatMessage(text);
  if (!filtered.allowed) {
    return {
      ok: false,
      error: AppError.validation({ code: 'CHAT_CONTENT_BLOCKED', context: { reason: filtered.reason } }),
    };
  }

  const messages = await deps.chat.listMessages(groupId);
  if (!messages.ok) return messages;
  const mine = messages.value
    .filter((m) => m.authorId === userId)
    .map((m) => Date.parse(m.createdAt));
  const rate = checkChatRate(mine, now.getTime());
  if (!rate.allowed) {
    return { ok: false, error: AppError.conflict({ code: 'CHAT_RATE_LIMITED' }) };
  }

  const sent = await deps.chat.sendMessage({ groupId, authorId: userId, text: text.trim() });
  if (!sent.ok) return sent;
  return ok(sent.value);
}

export async function reportChatMessage(
  deps: ChatDeps,
  groupId: string,
  messageId: string,
  userId: string,
): Promise<Result<ChatMessage>> {
  const member = await deps.groups.getMember(groupId, userId);
  if (!member.ok) return member;
  const active = member.value !== null && member.value.status === 'active';
  if (!canReport(active ? member.value!.role : null, active)) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  return deps.chat.reportMessage(messageId, userId);
}

export async function removeChatMessage(
  deps: ChatDeps,
  groupId: string,
  messageId: string,
  actorId: string,
): Promise<Result<ChatMessage>> {
  const member = await deps.groups.getMember(groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || !canModerate(member.value.role)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const removed = await deps.chat.removeMessage(messageId, actorId);
  if (!removed.ok) return removed;
  await deps.audit.append({
    actorId,
    action: 'wedding.chat.removed',
    target: `wedding:${groupId}`,
  });
  return ok(removed.value);
}

export async function muteChatMember(
  deps: ChatDeps,
  groupId: string,
  targetUserId: string,
  actorId: string,
  until: string | null,
): Promise<Result<ChatMute>> {
  const member = await deps.groups.getMember(groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || !canModerate(member.value.role)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const muted = await deps.chat.muteMember(groupId, targetUserId, actorId, until);
  if (!muted.ok) return muted;
  await deps.audit.append({
    actorId,
    action: 'wedding.chat.muted',
    target: `wedding:${groupId}`,
  });
  return ok(muted.value);
}

export async function unmuteChatMember(
  deps: ChatDeps,
  groupId: string,
  targetUserId: string,
  actorId: string,
): Promise<Result<void>> {
  const member = await deps.groups.getMember(groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || !canModerate(member.value.role)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  return deps.chat.unmuteMember(groupId, targetUserId);
}

export async function purgeExpiredChat(
  deps: ChatDeps,
  groupId: string,
  now: Date,
): Promise<Result<number>> {
  return deps.chat.purgeOlderThan(groupId, retentionCutoff(now));
}
