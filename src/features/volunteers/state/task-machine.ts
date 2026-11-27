// Pure volunteer task lifecycle. 6 statuses, 6 declared transitions.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { VolunteerTaskStatus } from '@/repositories/contracts/volunteer-task';

export const TASK_STATUSES = [
  'assigned',
  'accepted',
  'declined',
  'completed',
  'reviewed',
  'cancelled',
] as const;
export type TaskWorkflowStatus = (typeof TASK_STATUSES)[number];

export type TaskActor = 'volunteer' | 'staff';

export interface TaskTransition {
  readonly from: TaskWorkflowStatus;
  readonly to: TaskWorkflowStatus;
  readonly actor: TaskActor;
}

export const TASK_TRANSITIONS: readonly TaskTransition[] = Object.freeze([
  Object.freeze({ from: 'assigned', to: 'accepted', actor: 'volunteer' }),
  Object.freeze({ from: 'assigned', to: 'declined', actor: 'volunteer' }),
  Object.freeze({ from: 'assigned', to: 'cancelled', actor: 'staff' }),
  Object.freeze({ from: 'accepted', to: 'completed', actor: 'volunteer' }),
  Object.freeze({ from: 'accepted', to: 'cancelled', actor: 'staff' }),
  Object.freeze({ from: 'completed', to: 'reviewed', actor: 'staff' }),
] as const);

const TERMINAL: readonly TaskWorkflowStatus[] = ['declined', 'reviewed', 'cancelled'];

export function isTaskWorkflowStatus(value: string): value is TaskWorkflowStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

export function toTaskWorkflowStatus(status: VolunteerTaskStatus): TaskWorkflowStatus {
  return isTaskWorkflowStatus(status) ? status : 'assigned';
}

export function isTaskTerminal(status: TaskWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function canTaskTransition(
  from: TaskWorkflowStatus,
  to: TaskWorkflowStatus,
  actor?: TaskActor,
): boolean {
  return TASK_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextTaskStatuses(
  from: TaskWorkflowStatus,
  actor?: TaskActor,
): readonly TaskWorkflowStatus[] {
  return TASK_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertTaskTransition(
  from: TaskWorkflowStatus,
  to: TaskWorkflowStatus,
  actor?: TaskActor,
): Result<TaskWorkflowStatus> {
  if (canTaskTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}
