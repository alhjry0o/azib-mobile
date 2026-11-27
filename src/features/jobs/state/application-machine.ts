// Pure application lifecycle. 6 statuses, 10 declared transitions.
// Every transition stamps a real timestamp so the timeline is never invented.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { JobApplicationStatus } from '@/repositories/contracts/job-application';

export const APPLICATION_STATUSES = [
  'submitted',
  'viewed',
  'shortlisted',
  'rejected',
  'hired',
  'withdrawn',
] as const;
export type ApplicationWorkflowStatus = (typeof APPLICATION_STATUSES)[number];

export type ApplicationActor = 'applicant' | 'employer';

export interface ApplicationTransition {
  readonly from: ApplicationWorkflowStatus;
  readonly to: ApplicationWorkflowStatus;
  readonly actor: ApplicationActor;
}

export const APPLICATION_TRANSITIONS: readonly ApplicationTransition[] = Object.freeze([
  Object.freeze({ from: 'submitted', to: 'viewed', actor: 'employer' }),
  Object.freeze({ from: 'submitted', to: 'shortlisted', actor: 'employer' }),
  Object.freeze({ from: 'submitted', to: 'rejected', actor: 'employer' }),
  Object.freeze({ from: 'submitted', to: 'withdrawn', actor: 'applicant' }),
  Object.freeze({ from: 'viewed', to: 'shortlisted', actor: 'employer' }),
  Object.freeze({ from: 'viewed', to: 'rejected', actor: 'employer' }),
  Object.freeze({ from: 'viewed', to: 'withdrawn', actor: 'applicant' }),
  Object.freeze({ from: 'shortlisted', to: 'hired', actor: 'employer' }),
  Object.freeze({ from: 'shortlisted', to: 'rejected', actor: 'employer' }),
  Object.freeze({ from: 'shortlisted', to: 'withdrawn', actor: 'applicant' }),
] as const);

const TERMINAL: readonly ApplicationWorkflowStatus[] = ['rejected', 'hired', 'withdrawn'];

export function isApplicationWorkflowStatus(value: string): value is ApplicationWorkflowStatus {
  return (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export function toApplicationWorkflowStatus(
  status: JobApplicationStatus,
): ApplicationWorkflowStatus {
  return isApplicationWorkflowStatus(status) ? status : 'submitted';
}

export function isApplicationTerminal(status: ApplicationWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

/** Withdrawal frees an active slot (D-11). */
export function isActiveApplicationStatus(status: ApplicationWorkflowStatus): boolean {
  return status === 'submitted' || status === 'viewed' || status === 'shortlisted';
}

export function canApplicationTransition(
  from: ApplicationWorkflowStatus,
  to: ApplicationWorkflowStatus,
  actor?: ApplicationActor,
): boolean {
  return APPLICATION_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextApplicationStatuses(
  from: ApplicationWorkflowStatus,
  actor?: ApplicationActor,
): readonly ApplicationWorkflowStatus[] {
  const out: ApplicationWorkflowStatus[] = [];
  for (const t of APPLICATION_TRANSITIONS) {
    if (t.from !== from) continue;
    if (actor !== undefined && t.actor !== actor) continue;
    if (!out.includes(t.to)) out.push(t.to);
  }
  return out;
}

export function assertApplicationTransition(
  from: ApplicationWorkflowStatus,
  to: ApplicationWorkflowStatus,
  actor?: ApplicationActor,
): Result<ApplicationWorkflowStatus> {
  if (canApplicationTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}

export interface TimelineStep {
  readonly status: ApplicationWorkflowStatus;
  readonly at: string;
}

/** Built only from real stamps — never fabricated. */
export function buildTimeline(input: {
  readonly submittedAt: string;
  readonly viewedAt?: string | null;
  readonly shortlistedAt?: string | null;
  readonly rejectedAt?: string | null;
  readonly hiredAt?: string | null;
  readonly withdrawnAt?: string | null;
}): readonly TimelineStep[] {
  const steps: TimelineStep[] = [{ status: 'submitted', at: input.submittedAt }];
  if (input.viewedAt) steps.push({ status: 'viewed', at: input.viewedAt });
  if (input.shortlistedAt) steps.push({ status: 'shortlisted', at: input.shortlistedAt });
  if (input.rejectedAt) steps.push({ status: 'rejected', at: input.rejectedAt });
  if (input.hiredAt) steps.push({ status: 'hired', at: input.hiredAt });
  if (input.withdrawnAt) steps.push({ status: 'withdrawn', at: input.withdrawnAt });
  return steps.sort((a, b) => a.at.localeCompare(b.at));
}
