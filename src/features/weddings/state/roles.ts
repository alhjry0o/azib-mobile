// Group permissions live in the domain, not in screens. The UI guard is a
// convenience; real enforcement is RLS in P18 (AGENT_RULES §1 #19).
import type { GroupRole } from '@/repositories/contracts/wedding-group';

export type GroupPermission =
  | 'invite'
  | 'approve_join'
  | 'reject_join'
  | 'remove_member'
  | 'mute_member'
  | 'remove_message'
  | 'create_poll'
  | 'close_poll'
  | 'edit_budget'
  | 'adopt_budget'
  | 'cancel_group'
  | 'complete_group'
  | 'send_message'
  | 'view_private'
  | 'vote'
  | 'approve_share'
  | 'acknowledge_agreement'
  | 'request_service';

const ORGANIZER_ONLY: readonly GroupPermission[] = [
  'remove_member',
  'mute_member',
  'remove_message',
  'adopt_budget',
  'cancel_group',
  'complete_group',
];

const ORGANIZER_AND_CO: readonly GroupPermission[] = [
  'invite',
  'approve_join',
  'reject_join',
  'create_poll',
  'close_poll',
  'edit_budget',
  'request_service',
];

const EVERY_MEMBER: readonly GroupPermission[] = [
  'send_message',
  'view_private',
  'vote',
  'approve_share',
  'acknowledge_agreement',
];

export function can(role: GroupRole, permission: GroupPermission): boolean {
  if (role === 'organizer') return true;
  if (role === 'co_organizer') {
    return ORGANIZER_AND_CO.includes(permission) || EVERY_MEMBER.includes(permission);
  }
  return EVERY_MEMBER.includes(permission);
}

export function isOrganizerOnly(permission: GroupPermission): boolean {
  return ORGANIZER_ONLY.includes(permission);
}

/** Public discovery never exposes member identities (HRD P10 §3). */
export interface PublicGroupView {
  readonly titleKey: string;
  readonly governorateId: string | null;
  readonly districtId: string | null;
  readonly memberCount: number;
  readonly approximateDate: string;
}

export function toPublicGroupView(input: {
  readonly titleKey: string;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly memberCount: number;
  readonly scheduledDate: string;
}): PublicGroupView {
  return Object.freeze({
    titleKey: input.titleKey,
    governorateId: input.governorateId ?? null,
    districtId: input.districtId ?? null,
    memberCount: input.memberCount,
    // Month precision only — never the exact day in a public surface.
    approximateDate: input.scheduledDate.slice(0, 7),
  });
}
