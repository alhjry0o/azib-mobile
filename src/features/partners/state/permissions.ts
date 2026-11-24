// Marketplace permissions live in the domain. Ambassadors are strictly
// field workers: they never reach verification documents, applications,
// or any beneficiary data (D-9). Real enforcement is RLS in P18.
export type MarketplaceRole =
  | 'guest'
  | 'member'
  | 'partner_owner'
  | 'ambassador'
  | 'reviewer'
  | 'partner_verifier'
  | 'moderator'
  | 'admin'
  | 'auditor';

export type MarketplacePermission =
  | 'browse_partners'
  | 'view_offer'
  | 'save_offer'
  | 'report_offer'
  | 'contact_partner'
  | 'register_partner'
  | 'edit_own_partner'
  | 'submit_offer'
  | 'edit_own_offer'
  | 'cancel_own_offer'
  | 'view_own_stats'
  | 'apply_ambassador'
  | 'view_assigned_tasks'
  | 'submit_task'
  | 'nominate_partner'
  | 'review_offer'
  | 'publish_offer'
  | 'resolve_report'
  | 'decide_verification'
  | 'request_reverification'
  | 'suspend_partner'
  | 'reinstate_partner'
  | 'view_verification_documents'
  | 'view_beneficiary_data'
  | 'view_ambassador_applications';

const PUBLIC: readonly MarketplacePermission[] = [
  'browse_partners',
  'view_offer',
  'contact_partner',
];

const MEMBER: readonly MarketplacePermission[] = [
  ...PUBLIC,
  'save_offer',
  'report_offer',
  'register_partner',
  'apply_ambassador',
];

const OWNER: readonly MarketplacePermission[] = [
  ...MEMBER,
  'edit_own_partner',
  'submit_offer',
  'edit_own_offer',
  'cancel_own_offer',
  'view_own_stats',
];

const AMBASSADOR: readonly MarketplacePermission[] = [
  ...MEMBER,
  'view_assigned_tasks',
  'submit_task',
  'nominate_partner',
];

const REVIEWER: readonly MarketplacePermission[] = [
  ...PUBLIC,
  'review_offer',
  'publish_offer',
  'resolve_report',
];

const VERIFIER: readonly MarketplacePermission[] = [
  ...PUBLIC,
  'decide_verification',
  'request_reverification',
  'view_verification_documents',
];

const MODERATOR: readonly MarketplacePermission[] = [
  ...REVIEWER,
  'suspend_partner',
  'view_ambassador_applications',
];

const AUDITOR: readonly MarketplacePermission[] = [
  ...PUBLIC,
  'view_own_stats',
  'view_ambassador_applications',
];

/** Explicit deny-list, asserted by tests. */
export const AMBASSADOR_FORBIDDEN: readonly MarketplacePermission[] = Object.freeze([
  'view_verification_documents',
  'view_beneficiary_data',
  'view_ambassador_applications',
  'decide_verification',
  'request_reverification',
  'review_offer',
  'publish_offer',
  'resolve_report',
  'suspend_partner',
  'reinstate_partner',
  'edit_own_partner',
  'submit_offer',
  'edit_own_offer',
  'cancel_own_offer',
] as const);

export function can(role: MarketplaceRole, permission: MarketplacePermission): boolean {
  if (role === 'admin') return true;
  if (role === 'guest') return PUBLIC.includes(permission);
  if (role === 'member') return MEMBER.includes(permission);
  if (role === 'partner_owner') return OWNER.includes(permission);
  if (role === 'ambassador') {
    if (AMBASSADOR_FORBIDDEN.includes(permission)) return false;
    return AMBASSADOR.includes(permission);
  }
  if (role === 'reviewer') return REVIEWER.includes(permission);
  if (role === 'partner_verifier') return VERIFIER.includes(permission);
  if (role === 'moderator') return MODERATOR.includes(permission);
  return AUDITOR.includes(permission);
}

export function isForbiddenForAmbassador(permission: MarketplacePermission): boolean {
  return AMBASSADOR_FORBIDDEN.includes(permission);
}

/** Ownership is required on top of the role for own-resource edits. */
export function canEditOwnPartner(role: MarketplaceRole, isOwner: boolean): boolean {
  return isOwner && can(role, 'edit_own_partner');
}

export function canEditOwnOffer(role: MarketplaceRole, isOwner: boolean): boolean {
  return isOwner && can(role, 'edit_own_offer');
}
