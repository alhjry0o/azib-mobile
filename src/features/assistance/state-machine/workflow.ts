// Strict, pure workflow machine (P08.1). Legacy repository statuses are
// mapped on read; the machine itself only speaks the P08 vocabulary.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { ApplicationStatus } from '@/repositories/contracts/application';

export const WORKFLOW_STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'info_requested',
  'approved',
  'rejected',
  'appealed',
  'appeal_resolved',
  'disbursing',
  'completed',
  'cancelled',
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export type WorkflowActor = 'applicant' | 'reviewer' | 'finance' | 'system';

export interface WorkflowTransition {
  readonly from: WorkflowStatus;
  readonly to: WorkflowStatus;
  readonly actor: WorkflowActor;
}

export const WORKFLOW_TRANSITIONS: readonly WorkflowTransition[] = Object.freeze([
  Object.freeze({ from: 'draft', to: 'submitted', actor: 'applicant' }),
  Object.freeze({ from: 'draft', to: 'cancelled', actor: 'applicant' }),
  Object.freeze({ from: 'submitted', to: 'in_review', actor: 'reviewer' }),
  Object.freeze({ from: 'submitted', to: 'info_requested', actor: 'reviewer' }),
  Object.freeze({ from: 'submitted', to: 'cancelled', actor: 'applicant' }),
  Object.freeze({ from: 'in_review', to: 'approved', actor: 'reviewer' }),
  Object.freeze({ from: 'in_review', to: 'rejected', actor: 'reviewer' }),
  Object.freeze({ from: 'in_review', to: 'info_requested', actor: 'reviewer' }),
  Object.freeze({ from: 'info_requested', to: 'submitted', actor: 'applicant' }),
  Object.freeze({ from: 'info_requested', to: 'cancelled', actor: 'applicant' }),
  Object.freeze({ from: 'approved', to: 'disbursing', actor: 'finance' }),
  Object.freeze({ from: 'rejected', to: 'appealed', actor: 'applicant' }),
  Object.freeze({ from: 'rejected', to: 'cancelled', actor: 'applicant' }),
  Object.freeze({ from: 'appealed', to: 'appeal_resolved', actor: 'reviewer' }),
  Object.freeze({ from: 'appeal_resolved', to: 'approved', actor: 'reviewer' }),
  Object.freeze({ from: 'appeal_resolved', to: 'rejected', actor: 'reviewer' }),
  Object.freeze({ from: 'appeal_resolved', to: 'cancelled', actor: 'reviewer' }),
  Object.freeze({ from: 'disbursing', to: 'completed', actor: 'finance' }),
] as const);

const TERMINAL: readonly WorkflowStatus[] = ['completed', 'cancelled'];

export function isWorkflowStatus(value: string): value is WorkflowStatus {
  return (WORKFLOW_STATUSES as readonly string[]).includes(value);
}

/** Legacy aliases are read-only: 'reviewing' → in_review, 'disbursed' → disbursing. */
export function toWorkflowStatus(status: ApplicationStatus): WorkflowStatus {
  if (status === 'reviewing') return 'in_review';
  if (status === 'disbursed') return 'disbursing';
  return isWorkflowStatus(status) ? status : 'draft';
}

export function isTerminal(status: WorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function canTransition(
  from: WorkflowStatus,
  to: WorkflowStatus,
  actor?: WorkflowActor,
): boolean {
  return WORKFLOW_TRANSITIONS.some(
    (transition) =>
      transition.from === from &&
      transition.to === to &&
      (actor === undefined || transition.actor === actor),
  );
}

export function nextStatuses(
  from: WorkflowStatus,
  actor?: WorkflowActor,
): readonly WorkflowStatus[] {
  return WORKFLOW_TRANSITIONS.filter(
    (transition) =>
      transition.from === from && (actor === undefined || transition.actor === actor),
  ).map((transition) => transition.to);
}

export function assertTransition(
  from: WorkflowStatus,
  to: WorkflowStatus,
  actor?: WorkflowActor,
): Result<WorkflowStatus> {
  if (canTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}
