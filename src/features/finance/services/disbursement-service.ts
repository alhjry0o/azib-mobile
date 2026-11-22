// Disbursement orchestration with Maker≠Checker, an approved application,
// a proof reference, and a cumulative cap. Beneficiary actions verify ownership.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { ApplicationRepository } from '@/repositories/contracts/application';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type {
  Disbursement,
  DisbursementRepository,
} from '@/repositories/contracts/disbursement';
import {
  assertDisbursementTransition,
  toDisbursementWorkflowStatus,
} from '../state-machines/disbursement-machine';
import {
  assertAmountWithinCap,
  assertApplicationDisbursable,
  assertDistinctMakerChecker,
  assertProofReference,
  committedTotal,
} from '../state-machines/guards';
import { appendFinanceAudit } from './finance-audit';

export interface DisbursementDeps {
  readonly disbursements: DisbursementRepository;
  readonly applications: ApplicationRepository;
  readonly audit: AuditRepository;
}

export interface ProposeInput {
  readonly applicationId: string;
  readonly amount: number;
  readonly makerId: string;
}

export async function proposeDisbursement(
  deps: DisbursementDeps,
  input: ProposeInput,
): Promise<Result<Disbursement>> {
  const application = await deps.applications.getById(input.applicationId);
  if (!application.ok) return application;
  if (!application.value) {
    return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
  }
  const disbursable = assertApplicationDisbursable(application.value.status);
  if (!disbursable.ok) return disbursable;

  const existing = await deps.disbursements.listByApplication(input.applicationId);
  if (!existing.ok) return existing;
  const cap = assertAmountWithinCap(
    committedTotal(existing.value.items),
    input.amount,
    application.value.requestedAmount,
  );
  if (!cap.ok) return cap;

  const created = await deps.disbursements.create({
    applicationId: input.applicationId,
    amount: input.amount,
    makerId: input.makerId,
  });
  if (!created.ok) return created;
  await appendFinanceAudit(deps.audit, {
    actorId: input.makerId,
    action: 'disbursement.proposed',
    target: `disbursement:${created.value.id}`,
    to: 'proposed',
  });
  return created;
}

export interface DecideInput {
  readonly checkerId: string;
  readonly outcome: 'approved' | 'rejected';
  readonly reasonKey?: string;
}

export async function decideDisbursement(
  deps: DisbursementDeps,
  id: string,
  input: DecideInput,
): Promise<Result<Disbursement>> {
  const found = await deps.disbursements.getById(id);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DISBURSEMENT_NOT_FOUND' }) };

  const separation = assertDistinctMakerChecker(existing.makerId, input.checkerId);
  if (!separation.ok) return separation;

  const from = toDisbursementWorkflowStatus(existing.status);
  const allowed = assertDisbursementTransition(from, input.outcome, 'checker');
  if (!allowed.ok) return allowed;

  const moved = await deps.disbursements.advance(
    id,
    input.outcome === 'approved'
      ? { type: 'approve', checkerId: input.checkerId }
      : {
          type: 'reject',
          checkerId: input.checkerId,
          reasonKey: input.reasonKey ?? 'assistance:finance.reasons.rejected',
        },
    'checker',
  );
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId: input.checkerId,
    action: `disbursement.${input.outcome}`,
    target: `disbursement:${id}`,
    from,
    to: input.outcome,
  });
  return moved;
}

export async function recordDisbursementPayment(
  deps: DisbursementDeps,
  id: string,
  providerReference: string,
  actorId: string,
): Promise<Result<Disbursement>> {
  const found = await deps.disbursements.getById(id);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DISBURSEMENT_NOT_FOUND' }) };

  const reference = assertProofReference(providerReference);
  if (!reference.ok) return reference;

  const from = toDisbursementWorkflowStatus(existing.status);
  const allowed = assertDisbursementTransition(from, 'paid_recorded', 'finance_officer');
  if (!allowed.ok) return allowed;

  const moved = await deps.disbursements.advance(
    id,
    from === 'disputed'
      ? { type: 're_record_payment', providerReference: reference.value }
      : { type: 'record_payment', providerReference: reference.value },
    'finance_officer',
  );
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId,
    action: 'disbursement.paid_recorded',
    target: `disbursement:${id}`,
    from,
    to: 'paid_recorded',
  });
  return moved;
}

export interface BeneficiaryResponseInput {
  readonly beneficiaryUserId: string;
  readonly outcome: 'confirmed_by_beneficiary' | 'disputed';
  readonly note?: string;
}

export async function beneficiaryRespond(
  deps: DisbursementDeps,
  id: string,
  input: BeneficiaryResponseInput,
): Promise<Result<Disbursement>> {
  const found = await deps.disbursements.getById(id);
  if (!found.ok) return found;
  const existing = found.value;
  if (!existing) return { ok: false, error: AppError.notFound({ code: 'DISBURSEMENT_NOT_FOUND' }) };

  const application = await deps.applications.getById(existing.applicationId);
  if (!application.ok) return application;
  if (!application.value) {
    return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
  }
  if (application.value.applicantId !== input.beneficiaryUserId) {
    return { ok: false, error: AppError.forbidden({ code: 'NOT_BENEFICIARY' }) };
  }

  const from = toDisbursementWorkflowStatus(existing.status);
  const allowed = assertDisbursementTransition(from, input.outcome, 'beneficiary');
  if (!allowed.ok) return allowed;

  const moved = await deps.disbursements.advance(
    id,
    input.outcome === 'confirmed_by_beneficiary'
      ? { type: 'beneficiary_confirm' }
      : { type: 'beneficiary_dispute', note: input.note ?? '' },
    'beneficiary',
  );
  if (!moved.ok) return moved;
  await appendFinanceAudit(deps.audit, {
    actorId: input.beneficiaryUserId,
    action: `disbursement.${input.outcome}`,
    target: `disbursement:${id}`,
    from,
    to: input.outcome,
  });
  return moved;
}
