import type { Result } from '@/core/result';
import type { BaseEntity } from '../types';

export type GroupRole = 'organizer' | 'co_organizer' | 'member';
export type MemberStatus = 'active' | 'withdrawn' | 'removed';
export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface GroupMember extends BaseEntity {
  readonly groupId: string;
  readonly userId: string;
  readonly role: GroupRole;
  readonly status: MemberStatus;
  /** Consent to show the display name to group members only. */
  readonly displayNameConsent: boolean;
  readonly joinedAt: string;
  readonly withdrawnAt?: string | null;
}

export interface JoinRequest extends BaseEntity {
  readonly groupId: string;
  readonly userId: string;
  readonly message: string;
  readonly displayNameConsent: boolean;
  readonly status: JoinRequestStatus;
  readonly reasonKey?: string | null;
  readonly decidedBy?: string | null;
  readonly decidedAt?: string | null;
}

export interface GroupInvitation extends BaseEntity {
  readonly groupId: string;
  readonly inviterId: string;
  readonly inviteeId: string;
  readonly status: InvitationStatus;
}

export interface AddMemberInput {
  readonly groupId: string;
  readonly userId: string;
  readonly role?: GroupRole;
  readonly displayNameConsent: boolean;
}

export interface UpdateMemberInput {
  readonly role?: GroupRole;
  readonly status?: MemberStatus;
  readonly displayNameConsent?: boolean;
  readonly withdrawnAt?: string | null;
}

export interface CreateJoinRequestInput {
  readonly groupId: string;
  readonly userId: string;
  readonly message: string;
  readonly displayNameConsent: boolean;
}

export interface DecideJoinRequestInput {
  readonly decision: 'approved' | 'rejected';
  readonly decidedBy: string;
  readonly reasonKey?: string | null;
}

export interface CreateInvitationInput {
  readonly groupId: string;
  readonly inviterId: string;
  readonly inviteeId: string;
}

export interface WeddingGroupRepository {
  getMember(groupId: string, userId: string): Promise<Result<GroupMember | null>>;
  listMembers(groupId: string): Promise<Result<readonly GroupMember[]>>;
  addMember(input: AddMemberInput): Promise<Result<GroupMember>>;
  updateMember(id: string, input: UpdateMemberInput): Promise<Result<GroupMember>>;
  createJoinRequest(input: CreateJoinRequestInput): Promise<Result<JoinRequest>>;
  listJoinRequests(groupId: string): Promise<Result<readonly JoinRequest[]>>;
  decideJoinRequest(id: string, input: DecideJoinRequestInput): Promise<Result<JoinRequest>>;
  createInvitation(input: CreateInvitationInput): Promise<Result<GroupInvitation>>;
  listInvitations(groupId: string): Promise<Result<readonly GroupInvitation[]>>;
  updateInvitation(
    id: string,
    status: InvitationStatus,
  ): Promise<Result<GroupInvitation>>;
}
