// Append-only finance audit. Metadata is minimal: ids, statuses, actor.
// No amounts, no donor identity, no beneficiary identity (THREAT_MODEL A7).
import type { Result } from '@/core/result';
import type { AuditEntry, AuditRepository } from '@/repositories/contracts/audit';

export interface FinanceAuditInput {
  readonly actorId: string;
  readonly action: string;
  readonly target: string;
  readonly from?: string;
  readonly to?: string;
}

export async function appendFinanceAudit(
  audit: AuditRepository,
  input: FinanceAuditInput,
): Promise<Result<AuditEntry>> {
  const meta: Record<string, unknown> = {};
  if (input.from !== undefined) meta.from = input.from;
  if (input.to !== undefined) meta.to = input.to;
  return audit.append({
    actorId: input.actorId,
    action: input.action,
    target: input.target,
    meta,
  });
}
