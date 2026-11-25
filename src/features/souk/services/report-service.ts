import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type {
  SoukReport,
  SoukReportRepository,
  SoukReportStatus,
} from '@/repositories/contracts/souk-report';
import { ItemReportSchema } from '../schemas/item';
import { canSouk, type SoukRole } from '../state/permissions';

export interface SoukReportDeps {
  readonly reports: SoukReportRepository;
  readonly audit: AuditRepository;
}

export interface CreateReportInput {
  readonly itemId: string;
  readonly targetKind: 'item' | 'chat_message';
  readonly targetId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
}

export async function createReport(
  deps: SoukReportDeps,
  input: CreateReportInput,
): Promise<Result<SoukReport>> {
  if (!input.reporterId) return { ok: false, error: AppError.auth({ code: 'NO_SESSION' }) };
  const parsed = ItemReportSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  const created = await deps.reports.create(input);
  if (!created.ok) return created;
  await deps.audit.append({
    actorId: input.reporterId,
    action: 'souk.report.created',
    target: `souk-item:${input.itemId}`,
    meta: { reasonKey: input.reasonKey },
  });
  return ok(created.value);
}

export async function resolveReport(
  deps: SoukReportDeps,
  reportId: string,
  actorRole: SoukRole,
  actorId: string,
  status: SoukReportStatus,
  resolutionKey?: string,
): Promise<Result<SoukReport>> {
  if (!canSouk(actorRole, 'moderate_content')) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const moved = await deps.reports.updateStatus(reportId, status, actorId, resolutionKey ?? null);
  if (!moved.ok) return moved;
  await deps.audit.append({
    actorId,
    action: `souk.report.${status}`,
    target: `souk-report:${reportId}`,
  });
  return ok(moved.value);
}
