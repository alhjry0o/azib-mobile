// Job permissions live in the domain. Ownership is checked on top of the role.
// Real enforcement is RLS in P18 (AGENT_RULES §1 #19).
export type JobRole = 'guest' | 'member' | 'publisher' | 'moderator' | 'admin' | 'auditor';

export type JobPermission =
  | 'browse_jobs'
  | 'view_job'
  | 'save_job'
  | 'report_job'
  | 'apply_job'
  | 'withdraw_own_application'
  | 'publish_job'
  | 'edit_own_job'
  | 'close_own_job'
  | 'view_applicants'
  | 'view_applicant_cv'
  | 'decide_application'
  | 'review_job'
  | 'expire_job'
  | 'resolve_report';

const PUBLIC: readonly JobPermission[] = ['browse_jobs', 'view_job'];

const MEMBER: readonly JobPermission[] = [
  ...PUBLIC,
  'save_job',
  'report_job',
  'apply_job',
  'withdraw_own_application',
  'publish_job',
  'edit_own_job',
  'close_own_job',
  'view_applicants',
  'view_applicant_cv',
  'decide_application',
];

const MODERATOR: readonly JobPermission[] = [
  ...PUBLIC,
  'review_job',
  'expire_job',
  'resolve_report',
];

const AUDITOR: readonly JobPermission[] = [...PUBLIC, 'resolve_report'];

export function canJob(role: JobRole, permission: JobPermission): boolean {
  if (role === 'admin') return true;
  if (role === 'guest') return PUBLIC.includes(permission);
  if (role === 'member' || role === 'publisher') return MEMBER.includes(permission);
  if (role === 'moderator') return MODERATOR.includes(permission);
  return AUDITOR.includes(permission);
}

/** Ownership is required on top of the role for own-resource actions. */
export function canManageOwnJob(role: JobRole, isPublisher: boolean): boolean {
  return isPublisher && canJob(role, 'edit_own_job');
}

/** CV and applicant list are for the CONCERNED employer only (D-5). */
export function canViewApplicants(role: JobRole, isPublisher: boolean): boolean {
  return isPublisher && canJob(role, 'view_applicants');
}

export function canViewApplicantCv(role: JobRole, isPublisher: boolean): boolean {
  return isPublisher && canJob(role, 'view_applicant_cv');
}
