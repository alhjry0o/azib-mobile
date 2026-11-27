// Two-axis execution quality rating. Staff-private, never a moral score
// and never shown to the volunteer (ADR-0066 pattern).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { VolunteerTask } from '@/repositories/contracts/volunteer-task';
import { canViewTaskRatings, type VolunteerRole } from './permissions';

export const RATING_MIN = 1;
export const RATING_MAX = 5;
export const RATING_NOTE_MAX = 300;
export const TASK_REPORT_MIN = 20;
export const TASK_REPORT_MAX = 1000;

export interface TaskRatingInput {
  readonly timeliness: number;
  readonly completion: number;
  readonly note?: string | null;
}

export interface ValidTaskRating {
  readonly timeliness: number;
  readonly completion: number;
  readonly note: string | null;
}

function inRange(value: number): boolean {
  return Number.isInteger(value) && value >= RATING_MIN && value <= RATING_MAX;
}

export function validateTaskRating(input: TaskRatingInput): Result<ValidTaskRating> {
  if (!inRange(input.timeliness) || !inRange(input.completion)) {
    return { ok: false, error: AppError.validation({ code: 'INVALID_RATING' }) };
  }
  const note = (input.note ?? '').trim();
  if (note.length > RATING_NOTE_MAX) {
    return { ok: false, error: AppError.validation({ code: 'RATING_NOTE_TOO_LONG' }) };
  }
  return ok({
    timeliness: input.timeliness,
    completion: input.completion,
    note: note.length > 0 ? note : null,
  });
}

export function validateTaskReport(report: string): Result<string> {
  const trimmed = report.trim();
  if (trimmed.length < TASK_REPORT_MIN) {
    return { ok: false, error: AppError.validation({ code: 'TASK_REPORT_REQUIRED' }) };
  }
  if (trimmed.length > TASK_REPORT_MAX) {
    return { ok: false, error: AppError.validation({ code: 'TASK_REPORT_TOO_LONG' }) };
  }
  return ok(trimmed);
}

export interface StaffTaskRatingView {
  readonly taskId: string;
  readonly timeliness: number;
  readonly completion: number;
  readonly note: string | null;
  readonly reviewedAt: string | null;
}

/** Staff-private read. Deny-by-default for every other role. */
export function readTaskRatingForStaff(
  task: VolunteerTask,
  role: VolunteerRole,
): Result<StaffTaskRatingView | null> {
  if (!canViewTaskRatings(role)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const timeliness = task.timelinessScore ?? null;
  const completion = task.completionScore ?? null;
  if (timeliness === null || completion === null) return ok(null);
  return ok({
    taskId: task.id,
    timeliness,
    completion,
    note: task.ratingNote ?? null,
    reviewedAt: task.reviewedAt ?? null,
  });
}
