// Ambassadors are field workers. These deps deliberately contain NO access to
// applications, profiles or verification documents (D-9): the capability is
// absent, not merely unchecked.
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type {
  AmbassadorApplication,
  AmbassadorRepository,
  AmbassadorTask,
  AmbassadorTaskKind,
} from '@/repositories/contracts/ambassador';
import type { AuditRepository } from '@/repositories/contracts/audit';
import { AmbassadorApplySchema, AmbassadorTaskSubmitSchema } from '../schemas/registration';
import type { MarketplaceRole } from '../state/permissions';

export interface AmbassadorDeps {
  readonly ambassadors: AmbassadorRepository;
  readonly audit: AuditRepository;
}

function isStaff(role: MarketplaceRole): boolean {
  return role === 'moderator' || role === 'admin';
}

export async function applyAmbassador(
  deps: AmbassadorDeps,
  userId: string,
  governorateIds: readonly string[],
  motivation: string,
): Promise<Result<AmbassadorApplication>> {
  if (!userId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = AmbassadorApplySchema.safeParse({ governorateIds, motivation });
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const created = await deps.ambassadors.apply({
    userId,
    governorateIds: parsed.data.governorateIds,
    motivation: parsed.data.motivation,
  });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: userId,
    action: 'ambassador.applied',
    target: `ambassador:${created.value.id}`,
  });
  return ok(created.value);
}

export async function decideAmbassadorApplication(
  deps: AmbassadorDeps,
  applicationId: string,
  actorRole: MarketplaceRole,
  actorId: string,
  decision: 'approved' | 'rejected',
  reasonKey?: string,
): Promise<Result<AmbassadorApplication>> {
  if (!isStaff(actorRole)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const decided = await deps.ambassadors.decideApplication(
    applicationId,
    decision,
    actorId,
    reasonKey ?? null,
  );
  if (!decided.ok) return decided;
  await deps.audit.append({
    actorId,
    action: `ambassador.application.${decision}`,
    target: `ambassador:${applicationId}`,
  });
  return ok(decided.value);
}

export async function createAmbassadorTask(
  deps: AmbassadorDeps,
  actorRole: MarketplaceRole,
  actorId: string,
  ambassadorId: string,
  kind: AmbassadorTaskKind,
  governorateId: string,
  titleKey: string,
): Promise<Result<AmbassadorTask>> {
  if (!isStaff(actorRole)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  return deps.ambassadors.createTask({ ambassadorId, kind, governorateId, titleKey });
}

export async function submitAmbassadorTask(
  deps: AmbassadorDeps,
  taskId: string,
  userId: string,
  input: { nominatedPartnerId: string | null; photoFileIds: readonly string[] },
): Promise<Result<AmbassadorTask>> {
  const parsed = AmbassadorTaskSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const tasks = await deps.ambassadors.listTasks(userId);
  if (!tasks.ok) return tasks;
  const task = tasks.value.find((t) => t.id === taskId);
  if (!task) return { ok: false, error: AppError.forbidden({ code: 'NOT_ASSIGNED' }) };
  if (task.status !== 'assigned') {
    return { ok: false, error: AppError.conflict({ code: 'TASK_ALREADY_SUBMITTED' }) };
  }
  const application = await deps.ambassadors.getApplicationByUser(userId);
  if (!application.ok) return application;
  const regions = application.value?.governorateIds ?? [];
  if (!regions.includes(task.governorateId)) {
    return { ok: false, error: AppError.forbidden({ code: 'REGION_NOT_ASSIGNED' }) };
  }
  const updated = await deps.ambassadors.updateTask(taskId, {
    status: 'submitted',
    nominatedPartnerId: parsed.data.nominatedPartnerId,
    photoFileIds: parsed.data.photoFileIds,
    submittedAt: new Date().toISOString(),
  });
  if (!updated.ok) return updated;
  await deps.audit.append({
    actorId: userId,
    action: 'ambassador.task.submitted',
    target: `ambassador-task:${taskId}`,
  });
  return ok(updated.value);
}

export async function decideAmbassadorTask(
  deps: AmbassadorDeps,
  taskId: string,
  actorRole: MarketplaceRole,
  actorId: string,
  decision: 'accepted' | 'rejected',
  reasonKey?: string,
): Promise<Result<AmbassadorTask>> {
  if (!isStaff(actorRole)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  if (decision === 'rejected' && !reasonKey) {
    return { ok: false, error: AppError.validation({ code: 'REASON_REQUIRED' }) };
  }
  const updated = await deps.ambassadors.updateTask(taskId, {
    status: decision,
    decidedBy: actorId,
    decidedAt: new Date().toISOString(),
    reasonKey: reasonKey ?? null,
  });
  if (!updated.ok) return updated;
  await deps.audit.append({
    actorId,
    action: `ambassador.task.${decision}`,
    target: `ambassador-task:${taskId}`,
  });
  return ok(updated.value);
}
