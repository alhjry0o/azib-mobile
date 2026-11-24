// Domain enforcement for group lifecycle and membership (ADR-0027 pattern):
// repositories persist, this service guards. RLS in P18 is the real boundary.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { NotificationRepository } from '@/repositories/contracts/notification';
import type { Wedding, WeddingRepository } from '@/repositories/contracts/wedding';
import type {
  GroupInvitation,
  GroupMember,
  GroupRole,
  JoinRequest,
  WeddingGroupRepository,
} from '@/repositories/contracts/wedding-group';
import { assertGroupTransition, toGroupStatus, type GroupStatus } from '../state/group-machine';
import { can } from '../state/roles';
import { DEFAULT_WITHDRAWAL_POLICY, isWithdrawalWindowOpen } from '../engine/withdrawal-impact';
import { notifyWedding } from './wedding-notifications';

export interface GroupDeps {
  readonly weddings: WeddingRepository;
  readonly groups: WeddingGroupRepository;
  readonly notifications: NotificationRepository;
  readonly audit: AuditRepository;
}

export interface CreateGroupInput {
  readonly organizerId: string;
  readonly title: string;
  readonly governorateId: string;
  readonly districtId: string | null;
  readonly city: string | null;
  readonly scheduledDate: string;
  readonly alternateDate: string | null;
  readonly targetCount: number;
  readonly description: string | null;
  readonly maxGroupSize: number;
}

async function actorRole(
  groups: WeddingGroupRepository,
  groupId: string,
  userId: string,
): Promise<Result<GroupRole>> {
  const member = await groups.getMember(groupId, userId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  return ok(member.value.role);
}

export async function createGroup(
  deps: GroupDeps,
  input: CreateGroupInput,
): Promise<Result<Wedding>> {
  if (input.targetCount > input.maxGroupSize) {
    return { ok: false, error: AppError.validation({ code: 'GROUP_TOO_LARGE' }) };
  }
  const created = await deps.weddings.create({
    titleKey: 'weddings:custom.title',
    title: input.title,
    description: input.description,
    scheduledDate: input.scheduledDate,
    alternateDate: input.alternateDate,
    capacity: input.targetCount,
    targetCount: input.targetCount,
    organizerId: input.organizerId,
    governorateId: input.governorateId,
    districtId: input.districtId,
    city: input.city,
    withdrawalPolicyVersion: DEFAULT_WITHDRAWAL_POLICY.version,
    maxGroupSize: input.maxGroupSize,
  });
  if (!created.ok) return created;

  const member = await deps.groups.addMember({
    groupId: created.value.id,
    userId: input.organizerId,
    role: 'organizer',
    displayNameConsent: true,
  });
  if (!member.ok) return member;

  const opened = await deps.weddings.update(created.value.id, { status: 'open' });
  if (!opened.ok) return opened;
  await deps.audit.append({
    actorId: input.organizerId,
    action: 'wedding.created',
    target: `wedding:${created.value.id}`,
    meta: { to: 'open' },
  });
  return ok(opened.value);
}

export async function requestJoin(
  deps: GroupDeps,
  groupId: string,
  userId: string,
  message: string,
  displayNameConsent: boolean,
): Promise<Result<JoinRequest>> {
  const group = await deps.weddings.getById(groupId);
  if (!group.ok) return group;
  if (!group.value) return { ok: false, error: AppError.notFound({ code: 'GROUP_NOT_FOUND' }) };
  const status = toGroupStatus(group.value.status);
  if (status !== 'open' && status !== 'planning') {
    return { ok: false, error: AppError.conflict({ code: 'GROUP_NOT_JOINABLE' }) };
  }
  const existing = await deps.groups.getMember(groupId, userId);
  if (!existing.ok) return existing;
  if (existing.value && existing.value.status === 'active') {
    return { ok: false, error: AppError.conflict({ code: 'ALREADY_MEMBER' }) };
  }
  const members = await deps.groups.listMembers(groupId);
  if (!members.ok) return members;
  const active = members.value.filter((m) => m.status === 'active').length;
  const hardCap = group.value.maxGroupSize ?? group.value.capacity;
  const ceiling = Math.min(group.value.capacity, hardCap);
  if (active >= ceiling) {
    return { ok: false, error: AppError.conflict({ code: 'GROUP_FULL' }) };
  }
  return deps.groups.createJoinRequest({ groupId, userId, message, displayNameConsent });
}

export async function decideJoin(
  deps: GroupDeps,
  groupId: string,
  requestId: string,
  actorId: string,
  decision: 'approved' | 'rejected',
  reasonKey?: string,
): Promise<Result<JoinRequest>> {
  const role = await actorRole(deps.groups, groupId, actorId);
  if (!role.ok) return role;
  const permission = decision === 'approved' ? 'approve_join' : 'reject_join';
  if (!can(role.value, permission)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const requests = await deps.groups.listJoinRequests(groupId);
  if (!requests.ok) return requests;
  const request = requests.value.find((r) => r.id === requestId);
  if (!request) return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };

  const decided = await deps.groups.decideJoinRequest(requestId, {
    decision,
    decidedBy: actorId,
    reasonKey: reasonKey ?? null,
  });
  if (!decided.ok) return decided;

  if (decision === 'approved') {
    const added = await deps.groups.addMember({
      groupId,
      userId: request.userId,
      displayNameConsent: request.displayNameConsent,
    });
    if (!added.ok) return added;
  }
  await notifyWedding(
    deps.notifications,
    request.userId,
    decision === 'approved' ? 'joinApproved' : 'joinRejected',
  );
  await deps.audit.append({
    actorId,
    action: `wedding.join.${decision}`,
    target: `wedding:${groupId}`,
    meta: { to: decision },
  });
  return ok(decided.value);
}

export async function inviteMember(
  deps: GroupDeps,
  groupId: string,
  inviterId: string,
  inviteeId: string,
): Promise<Result<GroupInvitation>> {
  const role = await actorRole(deps.groups, groupId, inviterId);
  if (!role.ok) return role;
  if (!can(role.value, 'invite')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const invitation = await deps.groups.createInvitation({ groupId, inviterId, inviteeId });
  if (!invitation.ok) return invitation;
  await notifyWedding(deps.notifications, inviteeId, 'invite');
  return ok(invitation.value);
}

export async function respondInvite(
  deps: GroupDeps,
  groupId: string,
  invitationId: string,
  userId: string,
  accept: boolean,
  displayNameConsent: boolean,
): Promise<Result<GroupInvitation>> {
  const invitations = await deps.groups.listInvitations(groupId);
  if (!invitations.ok) return invitations;
  const invitation = invitations.value.find((i) => i.id === invitationId);
  if (!invitation) {
    return { ok: false, error: AppError.notFound({ code: 'INVITATION_NOT_FOUND' }) };
  }
  if (invitation.inviteeId !== userId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_INVITEE' }) };
  }
  const updated = await deps.groups.updateInvitation(
    invitationId,
    accept ? 'accepted' : 'declined',
  );
  if (!updated.ok) return updated;
  if (accept) {
    const added = await deps.groups.addMember({
      groupId,
      userId,
      displayNameConsent,
    });
    if (!added.ok) return added;
  }
  return ok(updated.value);
}

export async function changeMemberRole(
  deps: GroupDeps,
  groupId: string,
  memberId: string,
  actorId: string,
  role: GroupRole,
): Promise<Result<GroupMember>> {
  const actor = await actorRole(deps.groups, groupId, actorId);
  if (!actor.ok) return actor;
  if (actor.value !== 'organizer') {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (role === 'organizer') {
    return { ok: false, error: AppError.validation({ code: 'SINGLE_ORGANIZER' }) };
  }
  return deps.groups.updateMember(memberId, { role });
}

export async function withdrawMember(
  deps: GroupDeps,
  groupId: string,
  userId: string,
  scheduledDate: string,
  now: Date,
): Promise<Result<GroupMember>> {
  const member = await deps.groups.getMember(groupId, userId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (member.value.role === 'organizer') {
    return { ok: false, error: AppError.conflict({ code: 'ORGANIZER_MUST_CANCEL' }) };
  }
  const withinWindow = isWithdrawalWindowOpen(scheduledDate, now);
  const updated = await deps.groups.updateMember(member.value.id, {
    status: 'withdrawn',
    withdrawnAt: now.toISOString(),
  });
  if (!updated.ok) return updated;
  await deps.audit.append({
    actorId: userId,
    action: 'wedding.withdrawn',
    target: `wedding:${groupId}`,
    meta: { to: 'withdrawn', withinWindow },
  });
  return ok(updated.value);
}

export async function transitionGroup(
  deps: GroupDeps,
  groupId: string,
  actorId: string,
  to: GroupStatus,
  options: { readonly reasonKey?: string; readonly budgetAdopted?: boolean } = {},
): Promise<Result<Wedding>> {
  const group = await deps.weddings.getById(groupId);
  if (!group.ok) return group;
  if (!group.value) return { ok: false, error: AppError.notFound({ code: 'GROUP_NOT_FOUND' }) };
  const role = await actorRole(deps.groups, groupId, actorId);
  if (!role.ok) return role;
  if (role.value !== 'organizer') {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const from = toGroupStatus(group.value.status);
  const allowed = assertGroupTransition(from, to, 'organizer');
  if (!allowed.ok) return allowed;
  if (to === 'agreed' && options.budgetAdopted !== true) {
    return { ok: false, error: AppError.conflict({ code: 'BUDGET_NOT_ADOPTED' }) };
  }
  if (to === 'cancelled' && !options.reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  const updated = await deps.weddings.update(groupId, {
    status: to,
    ...(options.reasonKey !== undefined && { cancellationReasonKey: options.reasonKey }),
  });
  if (!updated.ok) return updated;
  await deps.audit.append({
    actorId,
    action: `wedding.${to}`,
    target: `wedding:${groupId}`,
    meta: { from, to },
  });
  return ok(updated.value);
}
