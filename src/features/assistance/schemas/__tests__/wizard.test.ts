import { seedAssistancePayloads } from '../../../../../mocks/seed/assistance';
import {
  ApplicantStepSchema,
  AssetsStepSchema,
  DocumentsStepSchema,
  IncomeStepSchema,
  ObligationsStepSchema,
  ReviewStepSchema,
  buildPayload,
  collectFieldErrors,
} from '../wizard';

const payload = seedAssistancePayloads[0]!;

describe('wizard step schemas', () => {
  it('accepts a complete applicant step', () => {
    expect(ApplicantStepSchema.safeParse(payload.applicant).success).toBe(true);
  });

  it('rejects missing fingerprints and empty governorate', () => {
    expect(
      ApplicantStepSchema.safeParse({ ...payload.applicant, identityHash: null }).success,
    ).toBe(false);
    expect(
      ApplicantStepSchema.safeParse({ ...payload.applicant, governorateId: '' }).success,
    ).toBe(false);
  });

  it('rejects fractional money in every numeric step', () => {
    expect(
      IncomeStepSchema.safeParse({ ...payload.income, monthlyIncome: 10.5 }).success,
    ).toBe(false);
    expect(
      AssetsStepSchema.safeParse({ ...payload.assets, availableAssets: -1 }).success,
    ).toBe(false);
    expect(
      ObligationsStepSchema.safeParse({ ...payload.obligations, monthlyRent: 1.5 }).success,
    ).toBe(false);
  });

  it('requires at least one document', () => {
    expect(DocumentsStepSchema.safeParse({ documents: [] }).success).toBe(false);
    expect(
      DocumentsStepSchema.safeParse({ documents: payload.documents }).success,
    ).toBe(true);
  });

  it('requires the three mandatory declarations', () => {
    const base = {
      requestedAmount: 100000,
      notes: '',
      truthful: true,
      verificationConsent: true,
      processingConsent: true,
      publicationConsent: false,
    };
    expect(ReviewStepSchema.safeParse(base).success).toBe(true);
    expect(ReviewStepSchema.safeParse({ ...base, truthful: false }).success).toBe(false);
    expect(ReviewStepSchema.safeParse({ ...base, verificationConsent: false }).success).toBe(false);
    expect(ReviewStepSchema.safeParse({ ...base, processingConsent: false }).success).toBe(false);
    expect(ReviewStepSchema.safeParse({ ...base, requestedAmount: 0 }).success).toBe(false);
  });

  it('publication consent stays optional', () => {
    const base = {
      requestedAmount: 1,
      notes: '',
      truthful: true,
      verificationConsent: true,
      processingConsent: true,
      publicationConsent: false,
    };
    expect(ReviewStepSchema.safeParse(base).success).toBe(true);
  });
});

describe('collectFieldErrors', () => {
  it('keeps the first message per field', () => {
    const errors = collectFieldErrors([
      { path: ['a'], message: 'first' },
      { path: ['a'], message: 'second' },
      { path: [], message: 'form-level' },
    ]);
    expect(errors.a).toBe('first');
    expect(errors.form).toBe('form-level');
  });
});

describe('buildPayload', () => {
  it('builds a valid payload from a complete draft', () => {
    const result = buildPayload({
      applicant: payload.applicant,
      income: payload.income,
      assets: payload.assets,
      obligations: payload.obligations,
      engagement: payload.engagement,
      documents: payload.documents,
      declarations: payload.declarations,
    });
    expect(result.ok).toBe(true);
  });

  it('fails honestly when a section is incomplete', () => {
    const result = buildPayload({
      applicant: { ...payload.applicant, householdSize: null },
      income: payload.income,
      assets: payload.assets,
      obligations: payload.obligations,
      engagement: payload.engagement,
      documents: payload.documents,
      declarations: payload.declarations,
    } as never);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('Validation');
  });
});
