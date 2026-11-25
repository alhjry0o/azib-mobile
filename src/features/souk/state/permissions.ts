// Souk permissions live in the domain. Ownership is checked on top of the role.
// Real enforcement is RLS in P18 (AGENT_RULES §1 #19).
export type SoukRole = 'guest' | 'member' | 'moderator' | 'admin' | 'auditor';

export type SoukPermission =
  | 'browse_items'
  | 'view_item'
  | 'create_item'
  | 'edit_own_item'
  | 'withdraw_own_item'
  | 'request_item'
  | 'cancel_own_request'
  | 'decide_request'
  | 'coordinate_chat'
  | 'confirm_handover'
  | 'rate_experience'
  | 'report_content'
  | 'moderate_content'
  | 'publish_item'
  | 'expire_item'
  | 'view_ratings'
  | 'view_contact';

const PUBLIC: readonly SoukPermission[] = ['browse_items', 'view_item'];

const MEMBER: readonly SoukPermission[] = [
  ...PUBLIC,
  'create_item',
  'edit_own_item',
  'withdraw_own_item',
  'request_item',
  'cancel_own_request',
  'coordinate_chat',
  'confirm_handover',
  'rate_experience',
  'report_content',
  'view_contact',
];

const MODERATOR: readonly SoukPermission[] = [
  ...PUBLIC,
  'decide_request',
  'moderate_content',
  'publish_item',
  'expire_item',
  'view_ratings',
];

const AUDITOR: readonly SoukPermission[] = [...PUBLIC, 'view_ratings'];

export function canSouk(role: SoukRole, permission: SoukPermission): boolean {
  if (role === 'admin') return true;
  if (role === 'guest') return PUBLIC.includes(permission);
  if (role === 'member') return MEMBER.includes(permission);
  if (role === 'moderator') return MODERATOR.includes(permission);
  return AUDITOR.includes(permission);
}

export function canEditOwnItem(role: SoukRole, isDonor: boolean): boolean {
  return isDonor && canSouk(role, 'edit_own_item');
}

export function canCancelOwnRequest(role: SoukRole, isRequester: boolean): boolean {
  return isRequester && canSouk(role, 'cancel_own_request');
}

/** Ratings are staff-private; never rendered on a public surface. */
export function canViewRatings(role: SoukRole): boolean {
  return canSouk(role, 'view_ratings');
}
