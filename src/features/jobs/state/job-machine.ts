// Pure job lifecycle. 6 statuses, 9 declared transitions.
// 'expired' is system-derived; the client computes and displays it only.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { JobStatus } from '@/repositories/contracts/job';

export const JOB_STATUSES = [
  'draft',
  'pending_review',
  'open',
  'closed',
  'expired',
  'rejected',
] as const;
export type JobWorkflowStatus = (typeof JOB_STATUSES)[number];

export type JobActor = 'publisher' | 'moderator' | 'system';

export interface JobTransition {
  readonly from: JobWorkflowStatus;
  readonly to: JobWorkflowStatus;
  readonly actor: JobActor;
}

export const JOB_TRANSITIONS: readonly JobTransition[] = Object.freeze([
  Object.freeze({ from: 'draft', to: 'pending_review', actor: 'publisher' }),
  Object.freeze({ from: 'draft', to: 'open', actor: 'publisher' }),
  Object.freeze({ from: 'pending_review', to: 'open', actor: 'moderator' }),
  Object.freeze({ from: 'pending_review', to: 'rejected', actor: 'moderator' }),
  Object.freeze({ from: 'open', to: 'closed', actor: 'publisher' }),
  Object.freeze({ from: 'open', to: 'expired', actor: 'system' }),
  Object.freeze({ from: 'closed', to: 'open', actor: 'publisher' }),
  Object.freeze({ from: 'expired', to: 'draft', actor: 'publisher' }),
  Object.freeze({ from: 'rejected', to: 'draft', actor: 'publisher' }),
] as const);

export function isJobWorkflowStatus(value: string): value is JobWorkflowStatus {
  return (JOB_STATUSES as readonly string[]).includes(value);
}

export function toJobWorkflowStatus(status: JobStatus): JobWorkflowStatus {
  return isJobWorkflowStatus(status) ? status : 'draft';
}

export function canJobTransition(
  from: JobWorkflowStatus,
  to: JobWorkflowStatus,
  actor?: JobActor,
): boolean {
  return JOB_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextJobStatuses(
  from: JobWorkflowStatus,
  actor?: JobActor,
): readonly JobWorkflowStatus[] {
  return JOB_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertJobTransition(
  from: JobWorkflowStatus,
  to: JobWorkflowStatus,
  actor?: JobActor,
): Result<JobWorkflowStatus> {
  if (canJobTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}

/** The client never writes 'expired' — it is system-derived. */
export function isClientWritableJobStatus(to: JobWorkflowStatus): boolean {
  return to !== 'expired';
}
