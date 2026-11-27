// Volunteer task lifecycle. DEPS DELIBERATELY CONTAIN NO financial applications,
// verification documents or job applications — the capability is ABSENT (D-9).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { VolunteerRepository } from '@/repositories/contracts/volunteer';
import type {
  VolunteerTask,
  VolunteerTaskKind,
  VolunteerTaskRepository,
} from '@/repositories/contracts/volunteer-task';
import {
  assertTaskTransition,
  toTaskWorkflowStatus,
  type TaskWorkflowStatus,
} from '../state/task-machine';
import { canReviewTasks, type VolunteerRole } from '../state/permissions';
import { validateTaskRating, validateTaskReport } from '../state/rating';

export interface VolunteerDeps {
  readonly volunteers: VolunteerRepository;
  readonly tasks: VolunteerTaskRepository;
  readonly audit: AuditRepository;
}

async function loadTask(deps: VolunteerDeps, taskId: string): Promise<Result<VolunteerTask>> {
  const found = await deps.tasks.getById(taskId);
  if (!found.ok) return found;
  if (!found.value) return { ok: false, error: AppError.notFound({ code: 'TASK_NOT_FOUND' }) };
  return ok(found.value);
}

async function assertAssignee(
  deps: VolunteerDeps,
  taskId: string,
  userId: string,
): Promise<Result<VolunteerTask>> {
  const task = await loadTask(deps, taskId);
  if (!task.ok) return task;
  if (task.value.volunteerId !== userId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_ASSIGNED' }) };
  }
  return ok(task.value);
}

async function move(
  deps: VolunteerDeps,
  taskId: string,
  snapshot: VolunteerTask,
  to: TaskWorkflowStatus,
  actor: 'volunteer' | 'staff',
  actorId: string,
  patch: Parameters<VolunteerTaskRepository['update']>[1],
): Promise<Result<VolunteerTask>> {
  const from = toTaskWorkflowStatus(snapshot.status);
  const allowed = assertTaskTransition(from, to, actor);
  if (!allowed.ok) return allowed;
  const moved = await deps.tasks.update(taskId, { ...patch, status: to });
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `volunteer.task.${to}`,
    target: `volunteer-task:${taskId}`,
    meta: { from, to },
  });
  return ok(moved.value);
}

export async function acceptTask(
  deps: VolunteerDeps,
  taskId: string,
  userId: string,
  now: Date,
): Promise<Result<VolunteerTask>> {
  const owned = await assertAssignee(deps, taskId, userId);
  if (!owned.ok) return owned;
  return move(deps, taskId, owned.value, 'accepted', 'volunteer', userId, {
    acceptedAt: now.toISOString(),
  });
}

export async function declineTask(
  deps: VolunteerDeps,
  taskId: string,
  userId: string,
  now: Date,
  reasonKey?: string,
): Promise<Result<VolunteerTask>> {
  const owned = await assertAssignee(deps, taskId, userId);
  if (!owned.ok) return owned;
  return move(deps, taskId, owned.value, 'declined', 'volunteer', userId, {
    declinedAt: now.toISOString(),
    reasonKey: reasonKey ?? null,
  });
}

/** Completion REQUIRES a written report (HRD P13 §4). */
export async function completeTask(
  deps: VolunteerDeps,
  taskId: string,
  userId: string,
  report: string,
  now: Date,
): Promise<Result<VolunteerTask>> {
  const owned = await assertAssignee(deps, taskId, userId);
  if (!owned.ok) return owned;
  const parsed = validateTaskReport(report);
  if (!parsed.ok) return parsed;
  return move(deps, taskId, owned.value, 'completed', 'volunteer', userId, {
    completedAt: now.toISOString(),
    report: parsed.value,
  });
}

export async function assignTask(
  deps: VolunteerDeps,
  actorRole: VolunteerRole,
  actorId: string,
  volunteerId: string,
  kind: VolunteerTaskKind,
  governorateId: string,
  titleKey: string,
): Promise<Result<VolunteerTask>> {
  if (actorRole !== 'moderator' && actorRole !== 'admin') {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const created = await deps.tasks.create({ volunteerId, kind, governorateId, titleKey });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId,
    action: 'volunteer.task.assigned',
    target: `volunteer-task:${created.value.id}`,
  });
  return ok(created.value);
}

export async function cancelTask(
  deps: VolunteerDeps,
  taskId: string,
  actorRole: VolunteerRole,
  actorId: string,
  now: Date,
  reasonKey: string,
): Promise<Result<VolunteerTask>> {
  if (actorRole !== 'moderator' && actorRole !== 'admin') {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (!reasonKey) return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  const task = await loadTask(deps, taskId);
  if (!task.ok) return task;
  return move(deps, taskId, task.value, 'cancelled', 'staff', actorId, {
    cancelledAt: now.toISOString(),
    reasonKey,
  });
}

/** Staff-only two-axis rating. Never projected to the volunteer. */
export async function reviewTask(
  deps: VolunteerDeps,
  taskId: string,
  actorRole: VolunteerRole,
  actorId: string,
  timeliness: number,
  completion: number,
  note: string | null,
  now: Date,
): Promise<Result<VolunteerTask>> {
  if (!canReviewTasks(actorRole)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const task = await loadTask(deps, taskId);
  if (!task.ok) return task;
  const parsed = validateTaskRating({ timeliness, completion, note });
  if (!parsed.ok) return parsed;
  return move(deps, taskId, task.value, 'reviewed', 'staff', actorId, {
    reviewedAt: now.toISOString(),
    timelinessScore: parsed.value.timeliness,
    completionScore: parsed.value.completion,
    ratingNote: parsed.value.note,
    ratedBy: actorId,
  });
}
