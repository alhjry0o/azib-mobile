// Booking requests to partners. No payment, no tracking, no receipt (ADR-0005).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type {
  CreateServiceRequestInput,
  ServiceRequest,
  ServiceRequestStatus,
  WeddingBudgetRepository,
} from '@/repositories/contracts/wedding-budget';
import type { WeddingGroupRepository } from '@/repositories/contracts/wedding-group';
import { can } from '../state/roles';

export interface ServiceRequestDeps {
  readonly budgets: WeddingBudgetRepository;
  readonly groups: WeddingGroupRepository;
  readonly audit: AuditRepository;
}

export async function createServiceRequest(
  deps: ServiceRequestDeps,
  groupId: string,
  actorId: string,
  input: Omit<CreateServiceRequestInput, 'groupId'>,
): Promise<Result<ServiceRequest>> {
  const member = await deps.groups.getMember(groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (!can(member.value.role, 'request_service')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const created = await deps.budgets.createServiceRequest({ ...input, groupId });
  if (!created.ok) return created;
  await deps.audit.append({
    actorId,
    action: 'wedding.service.requested',
    target: `wedding:${groupId}`,
  });
  return ok(created.value);
}

export async function respondServiceRequest(
  deps: ServiceRequestDeps,
  groupId: string,
  requestId: string,
  actorId: string,
  status: ServiceRequestStatus,
  reply?: string,
): Promise<Result<ServiceRequest>> {
  const member = await deps.groups.getMember(groupId, actorId);
  if (!member.ok) return member;
  if (!member.value || member.value.status !== 'active') {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_MEMBER' }) };
  }
  if (!can(member.value.role, 'request_service')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const updated = await deps.budgets.updateServiceRequest(requestId, status, reply ?? null);
  if (!updated.ok) return updated;
  await deps.audit.append({
    actorId,
    action: `wedding.service.${status}`,
    target: `wedding:${groupId}`,
  });
  return ok(updated.value);
}
