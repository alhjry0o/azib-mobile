// Volunteer permissions live in the domain. The deny-list is explicit and the
// capability is ABSENT from the service deps (ADR-0057 pattern).
export type VolunteerRole = 'guest' | 'member' | 'volunteer' | 'moderator' | 'admin' | 'auditor';

export type VolunteerPermission =
  | 'browse_tasks'
  | 'view_own_tasks'
  | 'register_volunteer'
  | 'update_own_profile'
  | 'accept_task'
  | 'decline_task'
  | 'complete_task'
  | 'assign_task'
  | 'cancel_task'
  | 'review_task'
  | 'view_task_ratings'
  | 'view_financial_applications'
  | 'view_verification_documents'
  | 'view_beneficiary_data'
  | 'view_job_applicants'
  | 'view_applicant_cv'
  | 'publish_job'
  | 'review_job';

/** Explicit deny-list, asserted element by element in tests. */
export const VOLUNTEER_FORBIDDEN: readonly VolunteerPermission[] = Object.freeze([
  'view_financial_applications',
  'view_verification_documents',
  'view_beneficiary_data',
  'view_job_applicants',
  'view_applicant_cv',
  'publish_job',
  'review_job',
  'assign_task',
  'cancel_task',
  'review_task',
  'view_task_ratings',
] as const);

const PUBLIC: readonly VolunteerPermission[] = ['browse_tasks'];

const VOLUNTEER: readonly VolunteerPermission[] = [
  ...PUBLIC,
  'view_own_tasks',
  'register_volunteer',
  'update_own_profile',
  'accept_task',
  'decline_task',
  'complete_task',
];

const STAFF: readonly VolunteerPermission[] = [
  ...PUBLIC,
  'view_own_tasks',
  'assign_task',
  'cancel_task',
  'review_task',
  'view_task_ratings',
];

export function canVolunteer(role: VolunteerRole, permission: VolunteerPermission): boolean {
  if (role === 'admin') return true;
  if (role === 'guest') return PUBLIC.includes(permission);
  if (role === 'member') return PUBLIC.includes(permission) || permission === 'register_volunteer';
  if (role === 'volunteer') {
    if (VOLUNTEER_FORBIDDEN.includes(permission)) return false;
    return VOLUNTEER.includes(permission);
  }
  if (role === 'moderator') return STAFF.includes(permission);
  return PUBLIC.includes(permission) || permission === 'view_task_ratings';
}

export function isForbiddenForVolunteer(permission: VolunteerPermission): boolean {
  return VOLUNTEER_FORBIDDEN.includes(permission);
}

export function canReviewTasks(role: VolunteerRole): boolean {
  return canVolunteer(role, 'review_task');
}

export function canViewTaskRatings(role: VolunteerRole): boolean {
  return canVolunteer(role, 'view_task_ratings');
}
