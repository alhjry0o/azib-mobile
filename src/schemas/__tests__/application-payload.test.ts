import {
  ApplicationPayloadSchema,
  UpdateApplicationInputSchema,
} from '../index';
import { seedAssistancePayloads } from '../../../mocks/seed/assistance';

const payload = seedAssistancePayloads[0]!;

describe('ApplicationPayloadSchema', () => {
  it('accepts a complete demo payload', () => {
    expect(ApplicationPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects fractional or negative money', () => {
    const fractional = {
      ...payload,
      income: { ...payload.income, monthlyIncome: 10.5 },
    };
    const negative = {
      ...payload,
      assets: { ...payload.assets, availableAssets: -1 },
    };
    expect(ApplicationPayloadSchema.safeParse(fractional).success).toBe(false);
    expect(ApplicationPayloadSchema.safeParse(negative).success).toBe(false);
  });

  it('requires a household size of at least one', () => {
    const zero = {
      ...payload,
      applicant: { ...payload.applicant, householdSize: 0 },
    };
    expect(ApplicationPayloadSchema.safeParse(zero).success).toBe(false);
  });

  it('rejects short fingerprints', () => {
    const weak = {
      ...payload,
      applicant: { ...payload.applicant, identityHash: 'abc' },
    };
    expect(ApplicationPayloadSchema.safeParse(weak).success).toBe(false);
  });

  it('rejects unknown engagement statuses', () => {
    const bad = {
      ...payload,
      engagement: { ...payload.engagement, engagementStatus: 'dating' },
    };
    expect(ApplicationPayloadSchema.safeParse(bad).success).toBe(false);
  });

  it('caps the document list', () => {
    const many = {
      ...payload,
      documents: Array.from({ length: 13 }, (_, i) => ({
        ...payload.documents[0],
        id: `doc-${i}`,
      })),
    };
    expect(ApplicationPayloadSchema.safeParse(many).success).toBe(false);
  });
});

describe('UpdateApplicationInputSchema', () => {
  it('accepts a partial patch', () => {
    expect(UpdateApplicationInputSchema.safeParse({ requestedAmount: 1000 }).success).toBe(true);
  });

  it('does not accept a status field', () => {
    const parsed = UpdateApplicationInputSchema.safeParse({ status: 'approved' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(Object.keys(parsed.data)).not.toContain('status');
  });
});
