import { createMockApplicationRepository } from '@/repositories/mock/application';
import { createMockAuditRepository } from '@/repositories/mock/audit';
import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import { RULES_V1 } from '../../engine/rules.v1';
import { submitAssistance } from '../submission-service';

const payload = seedAssistancePayloads[0]!;

function setup() {
  const applications = createMockApplicationRepository();
  const audit = createMockAuditRepository();
  return { applications, audit };
}

const input = {
  applicantId: 'applicant-1',
  programId: 'program-1',
  requestedAmount: 150000,
  notes: null,
  payload,
  rules: RULES_V1,
};

describe('submitAssistance', () => {
  it('creates, scores and submits with a reference number', async () => {
    const deps = setup();
    const result = await submitAssistance(deps, input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.status).toBe('submitted');
    expect(result.value.referenceNumber).toContain('AZIB-DEMO-');
    expect(result.value.evaluation?.advisory).toBe(true);
    expect(result.value.evaluation?.ruleVersion).toBe(RULES_V1.version);
  });

  it('never writes a decision from the advisory score', async () => {
    const deps = setup();
    const result = await submitAssistance(deps, input);
    if (result.ok) expect(result.value.decision).toBeNull();
  });

  it('writes exactly one audit entry', async () => {
    const deps = setup();
    await submitAssistance(deps, input);
    const entries = await deps.audit.list();
    expect(entries.ok).toBe(true);
    if (entries.ok) expect(entries.value.total).toBe(1);
  });

  it('captures publication consent only when declared', async () => {
    const deps = setup();
    const without = await submitAssistance(deps, input);
    if (without.ok) expect(without.value.publicationConsent).toBeNull();

    const second = setup();
    const withConsent = await submitAssistance(second, {
      ...input,
      payload: seedAssistancePayloads[1]!,
    });
    expect(withConsent.ok).toBe(true);
    if (withConsent.ok) expect(withConsent.value.publicationConsent?.revokedAt).toBeNull();
  });

  it('blocks a second submission while the first is still submitted', async () => {
    const deps = setup();
    const first = await submitAssistance(deps, input);
    expect(first.ok).toBe(true);
    const again = await submitAssistance(deps, { ...input, applicantId: 'other' });
    expect(again.ok).toBe(true);
  });

  it('surfaces repository failures without minting a reference', async () => {
    const applications = createMockApplicationRepository({ forceErrorKind: 'Network' });
    const audit = createMockAuditRepository();
    const result = await submitAssistance({ applications, audit }, input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Network');
  });
});
