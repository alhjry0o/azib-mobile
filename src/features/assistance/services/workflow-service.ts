// Enforces the strict machine, persists the change, and writes an audit entry.
// The repository stays permissive (P03 contract); this service is the guard.
// Known limitation: status + metadata are two calls in the mock, so a partial
// failure can leave them out of sync. P18 makes the transition atomic.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  Application,
  ApplicationRepository,
  UpdateApplicationInput,
} from '@/repositories/contracts/application';
import type { AuditRepository } from '@/repositories/contracts/audit';
import { assertTransition, toWorkflowStatus, type WorkflowActor } from '../state-machine';
import { appendApplicationAudit } from './audit-trail';

export interface WorkflowDeps {
  readonly applications: ApplicationRepository;
  readonly audit: AuditRepository;
}

export interface TransitionParams {
  readonly applicationId: string;
  readonly to: Parameters<typeof assertTransition>[1];
  readonly actor: WorkflowActor;
  readonly actorId: string;
  readonly patch?: UpdateApplicationInput;
  readonly reviewerNote?: string;
  /** Required for the appeal window check; comes from the versioned rules. */
  readonly appealWindowDays?: number;
  readonly now?: Date;
}

export async function applyTransition(
  deps: WorkflowDeps,
  params: TransitionParams,
): Promise<Result<Application>> {
  const found = await deps.applications.getById(params.applicationId);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) {
    return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
  }

  const from = toWorkflowStatus(existing.status);
  const allowed = assertTransition(from, params.to, params.actor);
  if (!allowed.ok) return allowed;

  if (params.to === 'appealed') {
    if (existing.appeal) {
      return { ok: false, error: AppError.conflict({ code: 'APPEAL_ALREADY_USED' }) };
    }
    const decidedAt = existing.decision?.decidedAt;
    const windowDays = params.appealWindowDays;
    if (decidedAt && windowDays !== undefined) {
      const now = (params.now ?? new Date()).getTime();
      const elapsed = now - Date.parse(decidedAt);
      if (Number.isFinite(elapsed) && elapsed > windowDays * 24 * 60 * 60 * 1000) {
        return { ok: false, error: AppError.conflict({ code: 'APPEAL_WINDOW_CLOSED' }) };
      }
    }
  }

  if (params.patch) {
    const patched = await deps.applications.update(params.applicationId, params.patch);
    if (!patched.ok) return patched;
  }

  const moved =
    params.to === 'submitted'
      ? await deps.applications.submit(params.applicationId)
      : await deps.applications.updateStatus(
          params.applicationId,
          params.to,
          params.reviewerNote,
        );
  if (!moved.ok) return moved;

  await appendApplicationAudit(deps.audit, {
    actorId: params.actorId,
    applicationId: params.applicationId,
    action: `application.${params.to}`,
    from,
    to: params.to,
    ruleVersion: moved.value.evaluation?.ruleVersion,
  });

  return moved;
}
