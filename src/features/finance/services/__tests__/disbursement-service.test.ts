import { createMockApplicationRepository } from '@/repositories/mock/application';
import { createMockAuditRepository } from '@/repositories/mock/audit';
import { createMockDisbursementRepository } from '@/repositories/mock/disbursement';
import {
  beneficiaryRespond,
  decideDisbursement,
  proposeDisbursement,
  recordDisbursementPayment,
} from '../disbursement-service';

async function setup(requestedAmount = 100000) {
  const applications = createMockApplicationRepository();
  const disbursements = createMockDisbursementRepository();
  const audit = createMockAuditRepository();
  const created = await applications.create({
    applicantId: 'beneficiary-1',
    programId: 'program-1',
    requestedAmount,
  });
  if (!created.ok) throw new Error('setup failed');
  await applications.updateStatus(created.value.id, 'approved');
  return { applications, disbursements, audit, applicationId: created.value.id };
}

describe('disbursement service', () => {
  it('proposes only against an approved application', async () => {
    const deps = await setup();
    const result = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 40000,
      makerId: 'maker-1',
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.status).toBe('proposed');
  });

  it('refuses a non-approved application', async () => {
    const deps = await setup();
    await deps.applications.updateStatus(deps.applicationId, 'submitted');
    const result = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 1000,
      makerId: 'maker-1',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.meta.code).toBe('APPLICATION_NOT_APPROVED');
  });

  it('enforces the cumulative cap', async () => {
    const deps = await setup(100000);
    await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 90000,
      makerId: 'maker-1',
    });
    const over = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 20000,
      makerId: 'maker-1',
    });
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.error.meta.code).toBe('AMOUNT_CAP_EXCEEDED');
  });

  it('Maker may never be the Checker', async () => {
    const deps = await setup();
    const proposed = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 10000,
      makerId: 'maker-1',
    });
    if (!proposed.ok) throw new Error('setup failed');
    const same = await decideDisbursement(deps, proposed.value.id, {
      checkerId: 'maker-1',
      outcome: 'approved',
    });
    expect(same.ok).toBe(false);
    if (!same.ok) expect(same.error.meta.code).toBe('MAKER_EQUALS_CHECKER');
    const different = await decideDisbursement(deps, proposed.value.id, {
      checkerId: 'checker-2',
      outcome: 'approved',
    });
    expect(different.ok).toBe(true);
  });

  it('requires a proof reference before recording payment', async () => {
    const deps = await setup();
    const proposed = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 10000,
      makerId: 'maker-1',
    });
    if (!proposed.ok) throw new Error('setup failed');
    await decideDisbursement(deps, proposed.value.id, {
      checkerId: 'checker-2',
      outcome: 'approved',
    });
    const empty = await recordDisbursementPayment(deps, proposed.value.id, '  ', 'finance-1');
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.error.meta.code).toBe('PROOF_REQUIRED');
    const paid = await recordDisbursementPayment(deps, proposed.value.id, 'proof-1', 'finance-1');
    expect(paid.ok).toBe(true);
  });

  it('only the beneficiary may confirm, and only after payment', async () => {
    const deps = await setup();
    const proposed = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 10000,
      makerId: 'maker-1',
    });
    if (!proposed.ok) throw new Error('setup failed');
    const early = await beneficiaryRespond(deps, proposed.value.id, {
      beneficiaryUserId: 'beneficiary-1',
      outcome: 'confirmed_by_beneficiary',
    });
    expect(early.ok).toBe(false);

    await decideDisbursement(deps, proposed.value.id, {
      checkerId: 'checker-2',
      outcome: 'approved',
    });
    await recordDisbursementPayment(deps, proposed.value.id, 'proof-1', 'finance-1');

    const stranger = await beneficiaryRespond(deps, proposed.value.id, {
      beneficiaryUserId: 'someone-else',
      outcome: 'confirmed_by_beneficiary',
    });
    expect(stranger.ok).toBe(false);
    if (!stranger.ok) expect(stranger.error.kind).toBe('Forbidden');

    const owner = await beneficiaryRespond(deps, proposed.value.id, {
      beneficiaryUserId: 'beneficiary-1',
      outcome: 'confirmed_by_beneficiary',
    });
    expect(owner.ok).toBe(true);
  });

  it('writes one audit entry per transition and no amounts in meta', async () => {
    const deps = await setup();
    const proposed = await proposeDisbursement(deps, {
      applicationId: deps.applicationId,
      amount: 10000,
      makerId: 'maker-1',
    });
    if (!proposed.ok) throw new Error('setup failed');
    await decideDisbursement(deps, proposed.value.id, {
      checkerId: 'checker-2',
      outcome: 'approved',
    });
    const entries = await deps.audit.list();
    expect(entries.ok).toBe(true);
    if (entries.ok) {
      expect(entries.value.total).toBe(2);
      expect(JSON.stringify(entries.value.items)).not.toContain('10000');
    }
  });
});
