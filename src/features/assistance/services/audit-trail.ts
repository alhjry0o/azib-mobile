// Append-only audit trail. Metadata is minimized: ids, statuses, rule version.
// Never payloads, never documents, never raw identifiers (THREAT_MODEL A7).
import type { Result } from '@/core/result';
import type { AuditEntry, AuditRepository } from '@/repositories/contracts/audit';

export interface AuditEventInput {
  readonly actorId: string;
  readonly applicationId: string;
  readonly action: string;
  readonly from?: string;
  readonly to?: string;
  readonly ruleVersion?: string;
}

export async function appendApplicationAudit(
  audit: AuditRepository,
  event: AuditEventInput,
): Promise<Result<AuditEntry>> {
  const meta: Record<string, unknown> = { applicationId: event.applicationId };
  if (event.from !== undefined) meta.from = event.from;
  if (event.to !== undefined) meta.to = event.to;
  if (event.ruleVersion !== undefined) meta.ruleVersion = event.ruleVersion;
  return audit.append({
    actorId: event.actorId,
    action: event.action,
    target: `application:${event.applicationId}`,
    meta,
  });
}
