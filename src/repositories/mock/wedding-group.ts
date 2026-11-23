import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  AddMemberInput,
  CreateInvitationInput,
  CreateJoinRequestInput,
  DecideJoinRequestInput,
  GroupInvitation,
  GroupMember,
  InvitationStatus,
  JoinRequest,
  UpdateMemberInput,
  WeddingGroupRepository,
} from '../contracts/wedding-group';
import type { MockRepositoryOptions } from './profile';

export function createMockWeddingGroupRepository(
  options: MockRepositoryOptions = {},
): WeddingGroupRepository {
  const { delayMs = 0, forceErrorKind = null } = options;
  const members = new Map<string, GroupMember>();
  const requests = new Map<string, JoinRequest>();
  const invitations = new Map<string, GroupInvitation>();
  let counter = 0;

  async function simulate(): Promise<AppError | null> {
    if (delayMs > 0) await new Promise<void>((r) => setTimeout(r, delayMs));
    if (forceErrorKind) return AppError.fromKind(forceErrorKind, { code: 'MOCK_FORCED_ERROR' });
    return null;
  }

  function nextId(prefix: string): string {
    counter += 1;
    return `mock-${prefix}-${Date.now()}-${counter}`;
  }

  return Object.freeze({
    async getMember(groupId: string, userId: string): Promise<Result<GroupMember | null>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const m of members.values()) {
        if (m.groupId === groupId && m.userId === userId) return ok(m);
      }
      return ok(null);
    },

    async listMembers(groupId: string): Promise<Result<readonly GroupMember[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(members.values()).filter((m) => m.groupId === groupId));
    },

    async addMember(input: AddMemberInput): Promise<Result<GroupMember>> {
      if (!input.groupId || !input.userId) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_MEMBER' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      for (const m of members.values()) {
        if (m.groupId === input.groupId && m.userId === input.userId) {
          return { ok: false, error: AppError.conflict({ code: 'ALREADY_MEMBER' }) };
        }
      }
      const now = new Date().toISOString();
      const member: GroupMember = Object.freeze({
        id: nextId('wedding-member'),
        groupId: input.groupId,
        userId: input.userId,
        role: input.role ?? 'member',
        status: 'active' as const,
        displayNameConsent: input.displayNameConsent,
        joinedAt: now,
        withdrawnAt: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      members.set(member.id, member);
      return ok(member);
    },

    async updateMember(id: string, input: UpdateMemberInput): Promise<Result<GroupMember>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = members.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'MEMBER_NOT_FOUND' }) };
      const updated: GroupMember = Object.freeze({
        ...existing,
        ...(input.role !== undefined && { role: input.role }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.displayNameConsent !== undefined && {
          displayNameConsent: input.displayNameConsent,
        }),
        ...(input.withdrawnAt !== undefined && { withdrawnAt: input.withdrawnAt }),
        updatedAt: new Date().toISOString(),
      });
      members.set(id, updated);
      return ok(updated);
    },

    async createJoinRequest(input: CreateJoinRequestInput): Promise<Result<JoinRequest>> {
      if (!input.groupId || !input.userId || !input.displayNameConsent) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_JOIN_REQUEST' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const request: JoinRequest = Object.freeze({
        id: nextId('wedding-join'),
        groupId: input.groupId,
        userId: input.userId,
        message: input.message.slice(0, 300),
        displayNameConsent: input.displayNameConsent,
        status: 'pending' as const,
        reasonKey: null,
        decidedBy: null,
        decidedAt: null,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      requests.set(request.id, request);
      return ok(request);
    },

    async listJoinRequests(groupId: string): Promise<Result<readonly JoinRequest[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(requests.values()).filter((r) => r.groupId === groupId));
    },

    async decideJoinRequest(
      id: string,
      input: DecideJoinRequestInput,
    ): Promise<Result<JoinRequest>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = requests.get(id);
      if (!existing) return { ok: false, error: AppError.notFound({ code: 'REQUEST_NOT_FOUND' }) };
      if (existing.status !== 'pending') {
        return { ok: false, error: AppError.conflict({ code: 'REQUEST_ALREADY_DECIDED' }) };
      }
      if (input.decision === 'rejected' && !input.reasonKey) {
        return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
      }
      const now = new Date().toISOString();
      const updated: JoinRequest = Object.freeze({
        ...existing,
        status: input.decision,
        reasonKey: input.reasonKey ?? null,
        decidedBy: input.decidedBy,
        decidedAt: now,
        updatedAt: now,
      });
      requests.set(id, updated);
      return ok(updated);
    },

    async createInvitation(input: CreateInvitationInput): Promise<Result<GroupInvitation>> {
      if (!input.groupId || !input.inviterId || !input.inviteeId) {
        return { ok: false, error: AppError.validation({ code: 'INVALID_INVITATION' }) };
      }
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const now = new Date().toISOString();
      const invitation: GroupInvitation = Object.freeze({
        id: nextId('wedding-invite'),
        groupId: input.groupId,
        inviterId: input.inviterId,
        inviteeId: input.inviteeId,
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
        dataOrigin: 'demo' as const,
      });
      invitations.set(invitation.id, invitation);
      return ok(invitation);
    },

    async listInvitations(groupId: string): Promise<Result<readonly GroupInvitation[]>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      return ok(Array.from(invitations.values()).filter((i) => i.groupId === groupId));
    },

    async updateInvitation(
      id: string,
      status: InvitationStatus,
    ): Promise<Result<GroupInvitation>> {
      const f = await simulate();
      if (f) return { ok: false, error: f };
      const existing = invitations.get(id);
      if (!existing) {
        return { ok: false, error: AppError.notFound({ code: 'INVITATION_NOT_FOUND' }) };
      }
      const updated: GroupInvitation = Object.freeze({
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      });
      invitations.set(id, updated);
      return ok(updated);
    },
  });
}
