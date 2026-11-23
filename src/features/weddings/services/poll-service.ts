import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { NotificationRepository } from '@/repositories/contracts/notification';
import type {
  CreatePollInput,
  WeddingPoll,
  WeddingPollRepository,
  WeddingVote,
} from '@/repositories/contracts/wedding-poll';
import type { WeddingGroupRepository } from '@/repositories/contracts/wedding-group';
import { can } from '../state/roles';
import { canChangeVote } from '../state/poll-rules';
import { notifyWedding } from './wedding-notifications';

export interface PollDeps {
  readonly polls: WeddingPollRepository;
  readonly groups: WeddingGroupRepository;
  readonly notifications: NotificationRepository;
  readonly audit: AuditRepository;
}

export async function createPoll(
  deps: PollDeps,
  groupId: string,
  actorId: string,
  input: Omit<CreatePollInput, 'groupId' | 'createdById'>,
): Promise<Result<WeddingPoll>> {
  const member = await deps.groups.getMember(groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (!can(member.value.role, 'create_poll')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const created = await deps.polls.createPoll({
    ...input,
    groupId,
    createdById: actorId,
  });
  if (!created.ok) return created;
  const members = await deps.groups.listMembers(groupId);
  if (members.ok) {
    for (const row of members.value) {
      if (row.status === 'active' && row.userId !== actorId) {
        await notifyWedding(deps.notifications, row.userId, 'poll');
      }
    }
  }
  await deps.audit.append({
    actorId,
    action: 'wedding.poll.created',
    target: `wedding:${groupId}`,
  });
  return ok(created.value);
}

export async function castVote(
  deps: PollDeps,
  pollId: string,
  userId: string,
  optionId: string,
  now: Date,
): Promise<Result<WeddingVote>> {
  const poll = await deps.polls.getPoll(pollId);
  if (!poll.ok) return poll;
  if (!poll.value) return { ok: false, error: AppError.notFound({ code: 'POLL_NOT_FOUND' }) };
  const member = await deps.groups.getMember(poll.value.groupId, userId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (!canChangeVote(poll.value.deadline, now)) {
    return { ok: false, error: AppError.conflict({ code: 'POLL_CLOSED' }) };
  }
  return deps.polls.castVote({ pollId, userId, optionId });
}

export async function closePoll(
  deps: PollDeps,
  pollId: string,
  actorId: string,
): Promise<Result<WeddingPoll>> {
  const poll = await deps.polls.getPoll(pollId);
  if (!poll.ok) return poll;
  if (!poll.value) return { ok: false, error: AppError.notFound({ code: 'POLL_NOT_FOUND' }) };
  const member = await deps.groups.getMember(poll.value.groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (!can(member.value.role, 'close_poll')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  return deps.polls.closePoll(pollId);
}
